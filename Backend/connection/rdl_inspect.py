import re, json, xml.etree.ElementTree as ET
from pathlib import Path

def get_ns(root):
    """Extract default XML namespace."""
    return {"ns": root.tag.split('}')[0].strip('{')}

def safe_text(node):
    return node.text if node is not None else None

def parse_conn_string(conn: str):
    """Parse connection string for server/database info."""
    if not conn:
        return {"raw": None, "server": None, "database": None}
    parts = [p for p in conn.split(';') if '=' in p]
    kv = dict((k.strip().lower(), v.strip()) for k, v in (p.split('=', 1) for p in parts))
    return {
        "raw": conn,
        "server": kv.get("data source") or kv.get("server") or kv.get("address") or kv.get("host"),
        "database": kv.get("initial catalog") or kv.get("database") or kv.get("dbname"),
    }

# --- SQL pattern helpers ---
SQL_FROM_JOIN = re.compile(r'\bfrom\s+([^\s,;]+)|\bjoin\s+([^\s,;]+)', re.I)
SQL_JOIN      = re.compile(r'\bjoin\b', re.I)
SQL_SUBQ      = re.compile(r'\(\s*select\b', re.I)
SQL_CTE       = re.compile(r'\bwith\s+[a-zA-Z_][\w]*\s+as\s*\(', re.I)
SQL_UNION     = re.compile(r'\bunion\b', re.I)
SQL_WINDOW    = re.compile(r'\bover\s*\(', re.I)
SQL_SP_EXEC   = re.compile(r'^\s*(exec|execute)\b', re.I)

def extract_tables(sql: str):
    """Heuristic: extract table-like tokens after FROM/JOIN."""
    if not sql: return []
    tables = []
    for m in SQL_FROM_JOIN.finditer(sql):
        t = (m.group(1) or m.group(2) or '').strip()
        if not t: 
            continue
        t = t.replace('[','').replace(']','').strip(',;')
        t = re.split(r'\s+as\s+|\s+', t, maxsplit=1, flags=re.I)[0]
        t = t.split(')')[-1]
        if t.lower().startswith(("select","values")) or '(' in t:
            continue
        tables.append(t)
    return list(dict.fromkeys(tables))  # unique preserve order

def sql_signals(sql, command_type=None):
    """SQL complexity counts (stored_proc via EXEC or CommandType)."""
    if not sql and not command_type:
        return {"joins":0,"subqueries":0,"cte":0,"union":0,"window":0,"stored_proc":0}
    res = {
        "joins": len(SQL_JOIN.findall(sql or "")),
        "subqueries": len(SQL_SUBQ.findall(sql or "")),
        "cte": len(SQL_CTE.findall(sql or "")),
        "union": len(SQL_UNION.findall(sql or "")),
        "window": len(SQL_WINDOW.findall(sql or "")),
        "stored_proc": 0
    }
    if SQL_SP_EXEC.search(sql or "") or (command_type or "").lower() == "storedprocedure":
        res["stored_proc"] = 1
    return res

# ---- Scoring config ----
WEIGHTS = {
    "dataset_base_over_2": 4,
    "tablix_base_over_1": 4,
    "chart_each": 3,
    "subreport_each": 10,
    "param_each": 1,
    "cascading_param_each": 3,
    "expr_each_cap40": 1,
    "group_depth_each": 2,
    "join_each": 2,
    "subquery_each": 5,
    "cte_each": 6,
    "window_each": 4,
    "union_each": 3,
    "stored_proc_each": 8,
    "custom_code": 8,
    "lookup": 4
}
THRESHOLDS = {"easy_max": 50, "moderate_max": 100}

def _cap(n, cap): 
    return n if n < cap else cap

def parse_rdl(file_path):
    """Parse single RDL and extract all metadata."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(path)
    try:
        tree = ET.parse(path)
    except ET.ParseError as e:
        raise ValueError(f"Invalid RDL XML: {e}")
    root = tree.getroot()
    ns = get_ns(root)

    # --- Expressions & Lookup detection ---
    expr_count = 0
    uses_lookup = False
    for node in root.iter():
        if isinstance(node.text, str):
            txt = node.text.strip()
            if txt.startswith("="):
                expr_count += 1
                if "Lookup(" in txt or "LookupSet(" in txt:
                    uses_lookup = True

    # --- Data Sources ---
    data_sources = []
    for ds in root.findall(".//ns:DataSources/ns:DataSource", ns):
        name = ds.get("Name")
        cp = ds.find("ns:ConnectionProperties", ns)
        conn = safe_text(cp.find("ns:ConnectString", ns)) if cp is not None else None
        provider = safe_text(cp.find("ns:DataProvider", ns)) if cp is not None else None
        parsed = parse_conn_string(conn)
        data_sources.append({
            "name": name,
            "provider": provider,
            "server": parsed["server"],
            "database": parsed["database"],
            "connect_string": conn
        })

    # --- Datasets ---
    datasets = []
    for d in root.findall(".//ns:DataSets/ns:DataSet", ns):
        name = d.get("Name")
        q = d.find("ns:Query", ns)
        ds_name = safe_text(q.find("ns:DataSourceName", ns)) if q is not None else None
        command_type = safe_text(q.find("ns:CommandType", ns)) if q is not None else None
        sql = safe_text(q.find("ns:CommandText", ns)) if q is not None else None
        tables = extract_tables(sql)
        signals = sql_signals(sql, command_type)
        datasets.append({
            "dataset_name": name,
            "data_source": ds_name,
            "command_type": command_type or "Text",
            "sql_preview": sql[:300] + "..." if sql and len(sql) > 300 else sql,
            "tables": tables,
            "sql_signals": signals
        })

    # --- Charts ---
    charts = []
    for ch in root.findall(".//ns:Chart", ns):
        charts.append({
            "name": ch.get("Name"),
            "type": safe_text(ch.find(".//ns:ChartSeries/ns:ChartType", ns))
        })

    # --- Parameters (with cascading flag) ---
    params = []
    for p in root.findall(".//ns:ReportParameters/ns:ReportParameter", ns):
        pname = p.get("Name")
        av = p.find("ns:ValidValues/ns:DataSetReference/ns:DataSetName", ns)
        params.append({"name": pname, "cascading": av is not None})

    # --- Tablix (with group depth) ---
    tablix_detail = []
    for t in root.findall(".//ns:Tablix", ns):
        rgroups = t.findall(".//ns:TablixRowHierarchy//ns:TablixMember", ns)
        cgroups = t.findall(".//ns:TablixColumnHierarchy//ns:TablixMember", ns)
        tablix_detail.append({
            "name": t.get("Name"),
            "row_groups": len(rgroups),
            "col_groups": len(cgroups)
        })
    tablix_names = [t["name"] for t in tablix_detail]
    max_group_depth = max([max(td["row_groups"], td["col_groups"]) for td in tablix_detail], default=0)

    # --- Subreports & Custom code ---
    subreports = [sr.get("Name") for sr in root.findall(".//ns:Subreport", ns)]
    custom_code = root.find(".//ns:Code", ns) is not None

    # --- Summary counts ---
    num_params = len(params)
    num_casc   = sum(1 for p in params if p.get("cascading"))
    num_tablix = len(tablix_names)
    num_charts = len(charts)
    num_subrpt = len(subreports)

    summary = {
        "report_name": path.name,
        "data_sources": len(data_sources),
        "datasets": len(datasets),
        "parameters": num_params,
        "cascading_parameters": num_casc,
        "tablix": num_tablix,
        "charts": num_charts,
        "subreports": num_subrpt,
        "expressions": expr_count,
        "custom_code": custom_code,
        "max_group_depth": max_group_depth
    }

    # --- Complexity score (weighted) ---
    joins=subq=cte=window=union=sp=0
    for d in datasets:
        s = d["sql_signals"]
        joins  += s.get("joins",0)
        subq   += s.get("subqueries",0)
        cte    += s.get("cte",0)
        window += s.get("window",0)
        union  += s.get("union",0)
        sp     += s.get("stored_proc",0)

    W = WEIGHTS
    score = 0
    score += max(0, len(datasets) - 2) * W["dataset_base_over_2"]
    score += max(0, num_tablix - 1)     * W["tablix_base_over_1"]
    score += num_charts   * W["chart_each"]
    score += num_subrpt   * W["subreport_each"]
    score += num_params   * W["param_each"]
    score += num_casc     * W["cascading_param_each"]
    score += _cap(expr_count, 40) * W["expr_each_cap40"]
    score += max_group_depth * W["group_depth_each"]

    score += joins  * W["join_each"]
    score += subq   * W["subquery_each"]
    score += cte    * W["cte_each"]
    score += window * W["window_each"]
    score += union  * W["union_each"]
    score += sp     * W["stored_proc_each"]

    if custom_code: score += W["custom_code"]
    if uses_lookup: score += W["lookup"]

    T = THRESHOLDS
    bucket = "Easy" if score <= T["easy_max"] else ("Moderate" if score <= T["moderate_max"] else "Complex")

    result = {
        "summary": summary,
        "data_sources": data_sources,
        "datasets": datasets,
        "charts": charts,
        "parameters": params,          # now includes cascading flag
        "tablix": tablix_names,        # keep original simple list for compatibility
        "tablix_detail": tablix_detail,# detailed groups info
        "subreports": subreports,
        "expressions": expr_count,
        "uses_lookup": uses_lookup,
        "custom_code": custom_code,
        "complexity": {"score": score, "bucket": bucket}
    }
    return result

# --- MAIN ENTRY ---
def main(file_path):
    result = parse_rdl(file_path)
    print(json.dumps(result, indent=2))

# Example usage:
if __name__ == "__main__":
    # Change path here to your RDL file
    main(r"D:\ssrs\RDL\RDL\Agg_DisbursementReport.rdl")
    # print("*"*80)
    # print("*"*80)
    # main(r"D:\ssrs\RDL\RDL\CnIB_Disbursement Report.rdl")
    # print("*"*80)
    # print("*"*80)
    # main(r"D:\ssrs\RDL\RDL\EB_Disbursement Report.rdl")
    # print("*"*80)
    # print("*"*80)
    # main(r"D:\ssrs\RDL\RDL\Minacs_Disbursement.rdl")
    # print("*"*80)
    # print("*"*80)
    # main(r"D:\ssrs\RDL\RDL\RB_Retail_Business_Disbursement.rdl")
    # print("*"*80)
    # print("*"*80)
    # main(r"D:\ssrs\RDL\RDL\SAP_Disbursement.rdl")
    # print("*"*80)
    # print("*"*80)
