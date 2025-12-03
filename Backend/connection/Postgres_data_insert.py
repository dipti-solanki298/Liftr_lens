import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    # -----------------------------
    # 1. Connect to default database
    # -----------------------------
    conn = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="123456",
        port=5432
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

    cursor = conn.cursor()
    print("Connected to PostgreSQL")

    # -----------------------------
    # 2. Create Instacart database
    # -----------------------------
    cursor.execute("DROP DATABASE IF EXISTS instacart;")
    cursor.execute("CREATE DATABASE instacart;")
    print("Database 'instacart' created!")

    cursor.close()
    conn.close()

    # -----------------------------
    # 3. Connect to Instacart DB
    # -----------------------------
    conn = psycopg2.connect(
        host="localhost",
        database="instacart",
        user="postgres",
        password="123456",
        port=5432
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    print("Connected to Instacart DB")

    # -----------------------------
    # 4. Create Schema
    # -----------------------------
    cursor.execute("CREATE SCHEMA IF NOT EXISTS sales_schema;")

    # -----------------------------
    # 5. CREATE TABLES (20 TABLES)
    # -----------------------------
    create_tables_sql = """

    -- 1. Customers
    CREATE TABLE sales_schema.customers (
        customer_id SERIAL PRIMARY KEY,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
    );

    -- 2. Customer Addresses
    CREATE TABLE sales_schema.customer_addresses (
        address_id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES sales_schema.customers(customer_id),
        street VARCHAR(100),
        city VARCHAR(100),
        state VARCHAR(50),
        postal_code VARCHAR(10),
        country VARCHAR(50)
    );

    -- 3. Products
    CREATE TABLE sales_schema.products (
        product_id SERIAL PRIMARY KEY,
        product_name VARCHAR(255),
        category_id INT,
        price NUMERIC(10,2),
        created_at TIMESTAMP DEFAULT NOW()
    );

    -- 4. Categories
    CREATE TABLE sales_schema.categories (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(100)
    );

    -- 5. Orders (Partitioned by month)
    CREATE TABLE sales_schema.orders (
        order_id BIGSERIAL,
        customer_id INT REFERENCES sales_schema.customers(customer_id),
        order_date DATE NOT NULL,
        status VARCHAR(50),
        total NUMERIC(12,2),
        PRIMARY KEY (order_id, order_date)
    ) PARTITION BY RANGE (order_date);

    -- 6. Order Partitions for 2025
    CREATE TABLE sales_schema.orders_2025_jan PARTITION OF sales_schema.orders
        FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

    CREATE TABLE sales_schema.orders_2025_feb PARTITION OF sales_schema.orders
        FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

    -- 7. Order Items
    CREATE TABLE sales_schema.order_items (
        order_item_id SERIAL PRIMARY KEY,
        order_id BIGINT,
        order_date DATE,
        product_id INT REFERENCES sales_schema.products(product_id),
        quantity INT,
        price NUMERIC(10,2),
        FOREIGN KEY (order_id, order_date)
            REFERENCES sales_schema.orders(order_id, order_date)
    );

    -- 8. Payments
    CREATE TABLE sales_schema.payments (
        payment_id SERIAL PRIMARY KEY,
        order_id BIGINT,
        order_date DATE,
        amount NUMERIC(12,2),
        payment_method VARCHAR(50),
        paid_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (order_id, order_date)
            REFERENCES sales_schema.orders(order_id, order_date)
    );

    -- 9. Inventory
    CREATE TABLE sales_schema.inventory (
        inventory_id SERIAL PRIMARY KEY,
        product_id INT REFERENCES sales_schema.products(product_id),
        quantity INT,
        last_updated TIMESTAMP DEFAULT NOW()
    );

    -- 10. Suppliers
    CREATE TABLE sales_schema.suppliers (
        supplier_id SERIAL PRIMARY KEY,
        supplier_name VARCHAR(255),
        contact_name VARCHAR(255),
        phone VARCHAR(30)
    );

    -- 11. Supplier Products
    CREATE TABLE sales_schema.supplier_products (
        supplier_id INT REFERENCES sales_schema.suppliers(supplier_id),
        product_id INT REFERENCES sales_schema.products(product_id),
        PRIMARY KEY (supplier_id, product_id)
    );

    -- 12. Delivery Drivers
    CREATE TABLE sales_schema.drivers (
        driver_id SERIAL PRIMARY KEY,
        driver_name VARCHAR(100),
        phone VARCHAR(20)
    );

    -- 13. Deliveries
    CREATE TABLE sales_schema.deliveries (
        delivery_id SERIAL PRIMARY KEY,
        order_id BIGINT,
        order_date DATE,
        driver_id INT REFERENCES sales_schema.drivers(driver_id),
        delivered_at TIMESTAMP,
        FOREIGN KEY (order_id, order_date)
            REFERENCES sales_schema.orders(order_id, order_date)
    );

    -- 14. Warehouses
    CREATE TABLE sales_schema.warehouses (
        warehouse_id SERIAL PRIMARY KEY,
        warehouse_name VARCHAR(255),
        location VARCHAR(255)
    );

    -- 15. Product Stock per Warehouse
    CREATE TABLE sales_schema.warehouse_stock (
        id SERIAL PRIMARY KEY,
        warehouse_id INT REFERENCES sales_schema.warehouses(warehouse_id),
        product_id INT REFERENCES sales_schema.products(product_id),
        quantity INT
    );

    -- 16. Discounts
    CREATE TABLE sales_schema.discounts (
        discount_id SERIAL PRIMARY KEY,
        description VARCHAR(255),
        discount_percent NUMERIC(5,2)
    );

    -- 17. Applied Discounts on Orders
    CREATE TABLE sales_schema.order_discounts (
        id SERIAL PRIMARY KEY,
        order_id BIGINT,
        order_date DATE,
        discount_id INT REFERENCES sales_schema.discounts(discount_id),
        FOREIGN KEY (order_id, order_date)
            REFERENCES sales_schema.orders(order_id, order_date)
    );

    -- 18. Employees
    CREATE TABLE sales_schema.employees (
        employee_id SERIAL PRIMARY KEY,
        employee_name VARCHAR(255),
        role VARCHAR(50)
    );

    -- 19. Audit Log
    CREATE TABLE sales_schema.audit_log (
        audit_id SERIAL PRIMARY KEY,
        table_name VARCHAR(100),
        operation VARCHAR(20),
        changed_at TIMESTAMP DEFAULT NOW()
    );

    -- 20. Product Reviews
    CREATE TABLE sales_schema.reviews (
        review_id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES sales_schema.customers(customer_id),
        product_id INT REFERENCES sales_schema.products(product_id),
        rating INT,
        review_text TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );

    """
    cursor.execute(create_tables_sql)

    print("All 20 tables created successfully.")

    # -----------------------------
    # 6. CREATE INDEXES
    # -----------------------------
    cursor.execute("""
        CREATE INDEX idx_orders_customer ON sales_schema.orders(customer_id);
        CREATE INDEX idx_products_category ON sales_schema.products(category_id);
        CREATE INDEX idx_order_items_product ON sales_schema.order_items(product_id);
        CREATE INDEX idx_inventory_product ON sales_schema.inventory(product_id);
    """)

    print("Indexes created successfully.")

    # -----------------------------
    # 7. CREATE TRIGGER + FUNCTION
    # -----------------------------
    trigger_sql = """
    CREATE OR REPLACE FUNCTION sales_schema.log_changes()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO sales_schema.audit_log(table_name, operation)
        VALUES (TG_TABLE_NAME, TG_OP);
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_log
    AFTER INSERT OR UPDATE OR DELETE
    ON sales_schema.products
    FOR EACH ROW EXECUTE FUNCTION sales_schema.log_changes();
    """

    cursor.execute(trigger_sql)
    print("Triggers created successfully.")

    # -----------------------------
    # 8. STORED PROCEDURE
    # -----------------------------
    procedure_sql = """
    CREATE OR REPLACE PROCEDURE sales_schema.add_inventory(p_product_id INT, p_quantity INT)
    LANGUAGE plpgsql
    AS $$
    BEGIN
        UPDATE sales_schema.inventory
        SET quantity = quantity + p_quantity,
            last_updated = NOW()
        WHERE product_id = p_product_id;
    END;
    $$;
    """

    cursor.execute(procedure_sql)
    print("Stored procedure created successfully.")

except Exception as e:
    print("Error:", e)

finally:
    if conn:
        conn.close()
        print("Connection closed.")
