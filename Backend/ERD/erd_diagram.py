from graphviz import Digraph

tables = {
    "departments": {
        "columns": [
            ("department_id", "PK"),
            ("department", "")
        ]
    },
    "aisles": {
        "columns": [
            ("aisle_id", "PK"),
            ("aisle", "")
        ]
    },
    "products": {
        "columns": [
            ("product_id", "PK"),
            ("product_name", ""),
            ("aisle_id", "FK"),
            ("department_id", "FK")
        ]
    },
    "orders": {
        "columns": [
            ("order_id", "PK"),
            ("user_id", ""),
            ("order_number", ""),
            ("order_dow", ""),
            ("order_hour_of_day", ""),
            ("days_since_prior_order", "")
        ]
    },
    "order_products": {
        "columns": [
            ("order_id", "FK"),
            ("product_id", "FK"),
            ("add_to_cart_order", ""),
            ("reordered", "")
        ]
    }
}

# Foreign Key Relationships
relationships = [
    ("aisles", "products", "aisle_id"),
    ("departments", "products", "department_id"),
    ("products", "order_products", "product_id"),
    ("orders", "order_products", "order_id")
]


# ----------------------------------------------
# 2. FUNCTION TO BUILD NODE LABELS LIKE ERD TABLES
# ----------------------------------------------

def format_table_label(table_name, columns):
    label = f"<<TABLE BORDER='1' CELLBORDER='1' CELLSPACING='0'>"
    label += f"<TR><TD BGCOLOR='lightgray'><B>{table_name}</B></TD></TR>"
    for col, key in columns:
        if key == "PK":
            label += f"<TR><TD><u>{col}</u> (PK)</TD></TR>"
        elif key == "FK":
            label += f"<TR><TD>{col} (FK)</TD></TR>"
        else:
            label += f"<TR><TD>{col}</TD></TR>"
    label += "</TABLE>>"
    return label


# ----------------------------------------------
# 3. GENERATE GRAPHVIZ ERD
# ----------------------------------------------

dot = Digraph("Instacart_ERD", format="png")
dot.attr(rankdir="LR")
dot.attr("node", shape="plaintext")

# Add tables
for table_name, meta in tables.items():
    dot.node(table_name, format_table_label(table_name, meta["columns"]))

# Add relationships (FK lines)
for parent, child, key in relationships:
    dot.edge(parent, child, label=key)

# ----------------------------------------------
# 4. OUTPUT FILE
# ----------------------------------------------

output_path = r"D:\Liftr\latest_code\Liftr_lens\Backend\ERD\instacart_erd"

dot.render(output_path, cleanup=True)
print("ERD generated:", output_path + ".png")
