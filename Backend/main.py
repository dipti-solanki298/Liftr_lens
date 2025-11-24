from connection.Remote_sql_server import fetch_sql_server_metadata as fetch_sql_server_metadata_func
import os
import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from connection.rdl_inspect import parse_rdl
import pyodbc

RDL_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploaded_rdls")
os.makedirs(RDL_UPLOAD_DIR, exist_ok=True)

ALLOWED_EXT = {".rdl"}
app = Flask(__name__)
CORS(app, supports_credentials=True)

conn = None

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/debug_connect_sql", methods=["POST"])
def debug_connect_sql():
    try:
        data = request.get_json()
        print("Received JSON:", data)

        server = data.get("server")
        username = data.get("username")
        password = data.get("password")

        conn_str = (
            f"DRIVER={{ODBC Driver 18 for SQL Server}};"
            f"SERVER={server};UID={username};PWD={password};"
            "Encrypt=no;TrustServerCertificate=yes;"
        )

        print("Connection string:", conn_str)

        conn = pyodbc.connect(conn_str, timeout=5)
        return jsonify({"status": "success"}), 200

    except Exception as e:
        print("Error connecting:", str(e))
        return jsonify({"status": "error", "error_message": str(e)}), 500


@app.route("/test_odbc", methods=["GET"])
def test_odbc():
    import pyodbc
    return jsonify({"drivers": pyodbc.drivers()})


@app.route("/connect_sql_server", methods=["POST"])
def connect_sql_server():
    global conn
    data = request.get_json()

    try:
        server = data.get("server")
        auth_type = data.get("auth_type", "no").lower()
        username = data.get("username")
        password = data.get("password")

        if not server:
            return jsonify({"status": "error", "message": "Server name is required"}), 400

        driver = "{ODBC Driver 18 for SQL Server}"

        if auth_type == "no":
            if not username or not password:
                return jsonify({"status": "error", "message": "Username and password required"}), 400

            conn_str = (
                f"DRIVER={driver};SERVER={server};UID={username};PWD={password};Encrypt=no;"
            )
        else:
            conn_str = (
                f"DRIVER={driver};SERVER={server};Trusted_Connection=yes;"
            )

        conn = pyodbc.connect(conn_str, timeout=5)

        return jsonify({"status": "success", "message": "Connection successful"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
    
@app.route("/disconnect_sql_server", methods=["POST"])
def disconnect_sql_server():
    global conn
    if conn:
        conn.close()
        conn = None
        return jsonify({"status": "success", "message": "Disconnected from SQL Server"}), 200
    else:
        return jsonify({"status": "error", "message": "No active connection to disconnect"}), 400

@app.route("/fetch_sql_server_metadata", methods=["GET"])
def fetch_sql_server_metadata_route():
    if not conn:
        return jsonify({"status": "error", "message": "No active SQL Server connection"}), 400
    
    try:
        metadata = fetch_sql_server_metadata_func(conn)
        # print("Fetched metadata:", metadata)
        return jsonify({"status": "success", "metadata": metadata}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/connections", methods=["GET"])
def get_all_connections():
    """Get all active connections."""
    return jsonify({
        "status": "success",
        "connections": [{"id": "default", "active": conn is not None}]
    }), 200


@app.route("/connections/<connection_id>", methods=["GET"])
def get_connection(connection_id):
    """Get connection by ID."""
    if connection_id != "default":
        return jsonify({"status": "error", "message": "Connection not found"}), 404
    
    return jsonify({
        "status": "success",
        "connection": {"id": "default", "active": conn is not None}
    }), 200


@app.route("/connections/<connection_id>", methods=["DELETE"])
def delete_connection(connection_id):
    """Delete connection by ID."""
    global conn
    if connection_id != "default":
        return jsonify({"status": "error", "message": "Connection not found"}), 404
    
    if conn:
        conn.close()
        conn = None
        return jsonify({"status": "success", "message": "Connection deleted"}), 200
    else:
        return jsonify({"status": "error", "message": "No active connection to delete"}), 400


@app.route("/connections/<connection_id>", methods=["PUT"])
def update_connection(connection_id):
    """Update connection by ID."""
    global conn
    if connection_id != "default":
        return jsonify({"status": "error", "message": "Connection not found"}), 404
    
    data = request.get_json()
    try:
        if conn:
            conn.close()
        
        server = data.get("server")
        auth_type = data.get("auth_type", "no").lower()
        username = data.get("username")
        password = data.get("password")
        
        if not server:
            return jsonify({"status": "error", "message": "Server name is required"}), 400
        
        if auth_type == "no":
            if not username or not password:
                return jsonify({"status": "error", "message": "Username and password required"}), 400
            conn_str = f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server};UID={username};PWD={password};Encrypt=no;"
        else:
            conn_str = f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server};Trusted_Connection=yes;"
        
        conn = pyodbc.connect(conn_str, timeout=5)
        return jsonify({"status": "success", "message": "Connection updated"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def allowed_file(filename):
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_EXT

@app.route("/inspect_rdl", methods=["POST"])
def inspect_rdl_route():
    """
    Inspect an uploaded RDL file and return its parsed JSON structure.

    **How it works:**
    - Accepts multipart/form-data with field name 'file'
    - Saves the uploaded .rdl file into /uploaded_rdls/
    - Runs parse_rdl() from rdl_inspect.py
    - Generates a <file>.json output beside the uploaded file
    - Returns parsed JSON as the response

    **Use this when:**
    - You want to upload a new RDL file
    - You want immediate parsing after upload

    **Returns:**
    - 200 OK with parsed JSON
    - 400/500 errors if file is invalid or parsing fails
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part in request. Use field name 'file'."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No filename provided."}), 400

    filename = secure_filename(file.filename)
    if not allowed_file(filename):
        return jsonify({"error": f"Only {', '.join(ALLOWED_EXT)} files allowed."}), 400

    saved_path = os.path.join(RDL_UPLOAD_DIR, f"{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}")
    try:
        file.save(saved_path)
    except Exception as e:
        return jsonify({"error": "Failed to save uploaded file.", "details": str(e)}), 500

    try:
        result = parse_rdl(saved_path)
    except FileNotFoundError:
        return jsonify({"error": "Saved file not found after upload."}), 500
    except ValueError as ve:
        return jsonify({"error": "Failed to parse RDL (invalid XML).", "details": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "Unexpected error while parsing RDL.", "details": str(e)}), 500

    # write result json next to the uploaded file
    json_filename = os.path.splitext(os.path.basename(saved_path))[0] + ".json"
    json_path = os.path.join(RDL_UPLOAD_DIR, json_filename)
    try:
        with open(json_path, "w", encoding="utf-8") as jf:
            import json as _json
            _json.dump(result, jf, indent=2, ensure_ascii=False)
    except Exception:
        # not fatal for the API response; continue
        pass

    return jsonify(result), 200


@app.route("/inspect_rdl_by_path", methods=["GET"])
def inspect_rdl_by_path_route():
    """
    Inspect an existing RDL file from the server by providing its file path.

    **How it works:**
    - Accepts query param 'path' (relative or absolute)
    - Loads the .rdl file from disk (usually from /uploaded_rdls/)
    - Runs parse_rdl() on it
    - Returns parsed JSON

    **Use this when:**
    - The RDL file is already uploaded/stored on the server
    - You want to re-parse a file without uploading again

    **Returns:**
    - 200 OK with parsed JSON
    - 404 if file not found
    - 400 if parsing fails
    """
    p = request.args.get("path")
    if not p:
        return jsonify({"error": "Query param 'path' required."}), 400

    # prefer files inside the upload dir for safety; allow absolute paths too if they exist
    candidate = os.path.join(RDL_UPLOAD_DIR, p) if not os.path.isabs(p) else p
    if not os.path.exists(candidate):
        return jsonify({"error": "File not found.", "path_checked": candidate}), 404

    try:
        result = parse_rdl(candidate)
    except Exception as e:
        return jsonify({"error": "Failed to parse RDL.", "details": str(e)}), 400

    return jsonify(result), 200


if __name__ == "__main__":
    app.run(debug=True)