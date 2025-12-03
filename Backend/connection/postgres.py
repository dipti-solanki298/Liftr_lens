import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


def get_metadata():
    all_metadata = {}

    conn = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="123456",
        port=5432
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()

    # 1. Get list of databases
    cursor.execute("SELECT datname FROM pg_database WHERE datistemplate=false;")
    databases = [db[0] for db in cursor.fetchall()]

    for db in databases:
        print(f"\n📌 Reading metadata from DB: {db}")
        all_metadata[db] = {}

        db_conn = psycopg2.connect(
            host="localhost",
            database=db,
            user="postgres",
            password="123456",
            port=5432
        )
        db_cursor = db_conn.cursor()

        # 2. Get schemas
        db_cursor.execute("""
            SELECT schema_name 
            FROM information_schema.schemata
            WHERE schema_name NOT LIKE 'pg_%'
            AND schema_name <> 'information_schema';
        """)
        schemas = [s[0] for s in db_cursor.fetchall()]

        all_metadata[db]["schemas"] = {}

        for schema in schemas:
            print(f"  ➤ Schema: {schema}")
            schema_meta = {}
            all_metadata[db]["schemas"][schema] = schema_meta

            # 3. Tables
            db_cursor.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = %s AND table_type = 'BASE TABLE';
            """, (schema,))

            tables = [t[0] for t in db_cursor.fetchall()]
            schema_meta["tables"] = {}

            for table in tables:
                print(f"      • Table: {table}")
                table_meta = {}
                schema_meta["tables"][table] = table_meta

                full_table = f"{schema}.{table}"

                # Columns
                db_cursor.execute("""
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_schema=%s AND table_name=%s;
                """, (schema, table))

                table_meta["columns"] = [
                    {
                        "column_name": row[0],
                        "data_type": row[1],
                        "nullable": row[2],
                        "default": row[3]
                    }
                    for row in db_cursor.fetchall()
                ]

                # Primary Keys
                db_cursor.execute("""
                    SELECT kcu.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name=kcu.constraint_name
                    WHERE tc.constraint_type='PRIMARY KEY'
                    AND tc.table_schema=%s
                    AND tc.table_name=%s;
                """, (schema, table))

                table_meta["primary_keys"] = [pk[0] for pk in db_cursor.fetchall()]

                # Foreign Keys
                db_cursor.execute("""
                    SELECT tc.constraint_name, kcu.column_name,
                           ccu.table_schema AS foreign_schema,
                           ccu.table_name AS foreign_table,
                           ccu.column_name AS foreign_column
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage ccu
                        ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.constraint_type='FOREIGN KEY'
                    AND tc.table_schema=%s
                    AND tc.table_name=%s;
                """, (schema, table))

                table_meta["foreign_keys"] = [
                    {
                        "constraint_name": row[0],
                        "column": row[1],
                        "foreign_schema": row[2],
                        "foreign_table": row[3],
                        "foreign_column": row[4],
                    }
                    for row in db_cursor.fetchall()
                ]

                # Indexes
                db_cursor.execute("""
                    SELECT indexname, indexdef
                    FROM pg_indexes
                    WHERE schemaname=%s AND tablename=%s;
                """, (schema, table))

                table_meta["indexes"] = [
                    {"index_name": row[0], "definition": row[1]}
                    for row in db_cursor.fetchall()
                ]

                # Triggers
                db_cursor.execute("""
                    SELECT trigger_name, event_manipulation, action_statement
                    FROM information_schema.triggers
                    WHERE event_object_schema=%s
                    AND event_object_table=%s;
                """, (schema, table))

                table_meta["triggers"] = [
                    {"trigger_name": row[0], "event": row[1], "action": row[2]}
                    for row in db_cursor.fetchall()
                ]

                # Check Constraints (fixed)
                db_cursor.execute("""
                    SELECT conname, pg_get_constraintdef(oid)
                    FROM pg_constraint
                    WHERE contype='c'
                    AND connamespace = (
                        SELECT oid FROM pg_namespace WHERE nspname=%s
                    )
                    AND conrelid = %s::regclass;
                """, (schema, full_table))

                table_meta["check_constraints"] = [
                    {"name": row[0], "definition": row[1]}
                    for row in db_cursor.fetchall()
                ]

                # Partitions (also requires schema.table)
                db_cursor.execute("""
                    SELECT inhrelid::regclass::text
                    FROM pg_inherits
                    WHERE inhparent = %s::regclass;
                """, (full_table,))

                table_meta["partitions"] = [p[0] for p in db_cursor.fetchall()]

            # Functions
            db_cursor.execute("""
                SELECT routine_name, routine_type, data_type
                FROM information_schema.routines
                WHERE specific_schema=%s;
            """, (schema,))
            schema_meta["functions"] = [
                {"name": r[0], "type": r[1], "return_type": r[2]}
                for r in db_cursor.fetchall()
            ]

            # Procedures
            db_cursor.execute("""
                SELECT proname
                FROM pg_proc
                JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
                WHERE nspname=%s AND prokind='p';
            """, (schema,))
            schema_meta["procedures"] = [p[0] for p in db_cursor.fetchall()]

            # Views
            db_cursor.execute("""
                SELECT table_name, view_definition
                FROM information_schema.views
                WHERE table_schema=%s;
            """, (schema,))
            schema_meta["views"] = [
                {"name": v[0], "definition": v[1]}
                for v in db_cursor.fetchall()
            ]

        db_conn.close()

    conn.close()
    return all_metadata


# Run the metadata extractor
data = get_metadata()

import json
filename = "postgres_metadata.json"

with open(filename, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)

print(f"Metadata saved successfully to {filename}")

print(json.dumps(data, indent=4))
