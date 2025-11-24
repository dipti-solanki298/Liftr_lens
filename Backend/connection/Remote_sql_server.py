import pyodbc
import json
from datetime import datetime
from flask import Flask, request, jsonify

# def connect_sql_server(data):
#     # data = request.get_json()
#     server = data.get("server")
#     auth_type = data.get("auth_type", "no").lower()   # "yes" or "no"
#     username = data.get("username")
#     password = data.get("password")
#     # server = str(input("Please Enter Server Name : ")) #13.203.18.7,49986 # 172.31.24.72,49986
#     # auth_type = str(input("Use Windows Authentication? (yes/no): ")).strip().lower()
#     if auth_type == "no":
#         driver = "{ODBC Driver 18 for SQL Server}"
#         # username = input("Enter Username: ") # sysdba
#         # password = input("Enter Password: ") # APP1e2025Nov
#         conn_str = f"DRIVER={driver};SERVER={server};UID={username};PWD={password};Encrypt=no;"
#     else:
#         conn_str = f'DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server};Trusted_Connection=yes;'

#     conn = pyodbc.connect(conn_str, timeout=5)
#     print("✅ Connection successful!\n")
#     return conn

def connect_sql_server(data):
    try:

        server = data.get("server")
        auth_type = data.get("auth_type", "no").lower()   # "yes" or "no"
        username = data.get("username")
        password = data.get("password")

        if not server:
            return jsonify({"status": "error", "message": "Server name is required"}), 400

        if auth_type == "no":
            driver = "{ODBC Driver 18 for SQL Server}"
            if not username or not password:
                return jsonify({"status": "error", "message": "Username and password required"}), 400

            conn_str = (
                f"DRIVER={driver};SERVER={server};"
                f"UID={username};PWD={password};Encrypt=no;"
            )
        else:
            conn_str = (
                f"DRIVER={{ODBC Driver 18 for SQL Server}};"
                f"SERVER={server};Trusted_Connection=yes;"
            )

        conn = pyodbc.connect(conn_str, timeout=5)
        print("Connection successful!\n")

        return conn

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def fetch_sql_server_metadata(conn):
    metadata = {}

    try:
        # conn = connect_sql_server()
        cursor = conn.cursor()

        # ---------- 1️⃣ List all databases ----------
        cursor.execute("SELECT name FROM sys.databases WHERE database_id > 4")
        dbs = [row.name for row in cursor.fetchall()]
        print("=== Databases Found ===")
        for db in dbs:
            print(f"📘 {db}")
        print()

        # ---------- 2️⃣ Loop through each database ----------
        for db in dbs:
            print(f"\n🔹 Fetching metadata for database: {db}")
            metadata[db] = {}

            try:
                # ---------- Tables ----------
                table_query = f"""
                SELECT 
                    t.TABLE_SCHEMA,
                    t.TABLE_NAME,
                    s.create_date,
                    s.modify_date
                FROM [{db}].INFORMATION_SCHEMA.TABLES t
                JOIN [{db}].sys.tables s 
                    ON t.TABLE_NAME = s.name
                WHERE t.TABLE_TYPE = 'BASE TABLE'
                ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME;
                """
                cursor.execute(table_query)
                tables = cursor.fetchall()

                metadata[db]['tables'] = []
                for t in tables:
                    metadata[db]['tables'].append({
                        'schema': t.TABLE_SCHEMA,
                        'name': t.TABLE_NAME,
                        'created_at': str(t.create_date),
                        'modified_at': str(t.modify_date),
                        'columns': []
                    })

                # ---------- Columns ----------
                col_query = f"""
                SELECT 
                    TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE, 
                    CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT
                FROM [{db}].INFORMATION_SCHEMA.COLUMNS
                ORDER BY TABLE_SCHEMA, TABLE_NAME;
                """
                cursor.execute(col_query)
                columns = cursor.fetchall()
                for c in columns:
                    for tbl in metadata[db]['tables']:
                        if tbl['name'] == c.TABLE_NAME and tbl['schema'] == c.TABLE_SCHEMA:
                            tbl['columns'].append({
                                'column_name': c.COLUMN_NAME,
                                'data_type': c.DATA_TYPE,
                                'max_length': c.CHARACTER_MAXIMUM_LENGTH,
                                'nullable': c.IS_NULLABLE,
                                'default': c.COLUMN_DEFAULT
                            })
                            break

                # ---------- Views ----------
                view_query = f"""
                SELECT 
                    name, create_date, modify_date
                FROM [{db}].sys.views
                ORDER BY name;
                """
                cursor.execute(view_query)
                metadata[db]['views'] = [
                    {'name': v.name, 'created_at': str(v.create_date), 'modified_at': str(v.modify_date)}
                    for v in cursor.fetchall()
                ]

                # ---------- Stored Procedures ----------
                proc_query = f"""
                SELECT 
                    name, create_date, modify_date
                FROM [{db}].sys.procedures
                ORDER BY name;
                """
                cursor.execute(proc_query)
                metadata[db]['procedures'] = [
                    {'name': p.name, 'created_at': str(p.create_date), 'modified_at': str(p.modify_date)}
                    for p in cursor.fetchall()
                ]

                # ---------- Functions ----------
                func_query = f"""
                SELECT 
                    name, create_date, modify_date
                FROM [{db}].sys.objects
                WHERE type_desc LIKE '%FUNCTION%'
                ORDER BY name;
                """
                cursor.execute(func_query)
                metadata[db]['functions'] = [
                    {'name': f.name, 'created_at': str(f.create_date), 'modified_at': str(f.modify_date)}
                    for f in cursor.fetchall()
                ]

                # ---------- Triggers ----------
                trigger_query = f"""
                SELECT 
                    name, create_date, modify_date
                FROM [{db}].sys.triggers
                ORDER BY name;
                """
                cursor.execute(trigger_query)
                metadata[db]['triggers'] = [
                    {'name': tr.name, 'created_at': str(tr.create_date), 'modified_at': str(tr.modify_date)}
                    for tr in cursor.fetchall()
                ]

            except Exception as inner_e:
                print(f"⚠️ Could not read metadata for {db}: {inner_e}")

        print("\n✅ Metadata extraction complete!\n")

        file_name = f"sqlserver_metadata_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(file_name, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4)
        print(f"📁 Metadata exported to: {file_name}")
        return metadata
    except Exception as e:
        print("❌ Connection failed:", e)

    finally:
        try:
            conn.close()
            return metadata
        except:
            pass



if __name__ == "__main__":
    # fetch_sql_server_metadata()
    connect_sql_server()