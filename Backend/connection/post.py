import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="123456",
        port=5432
    )
    print("Connection to PostgreSQL successful!")

except psycopg2.Error as e:
    print(f"Error connecting to PostgreSQL: {e}")

finally:
    if 'conn' in locals() and conn:
        conn.close()
        print("PostgreSQL connection closed.")