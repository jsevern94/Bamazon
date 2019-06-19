DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
	-- Unique IDs 
	id INTEGER NOT NULL AUTO_INCREMENT,
	-- Name of the product
	product_name VARCHAR(100) NOT NULL,
	-- Name of the department that the product belongs to
	department_name VARCHAR(100) NOT NULL,
	-- Price of the product
	price DECIMAL(10,2) NOT NULL,
	-- Quantity of product remaining
	stock_quantity INTEGER(10) NOT NULL,
    -- Set the Primary Key as the ID
    PRIMARY KEY (id)
);

ALTER TABLE products AUTO_INCREMENT=1001;

INSERT INTO products (product_name, department_name, price, stock_quantity)
values 	("Sony PlayStation 4", "Electronics", 299.99, 40),
		("Gibson SG Standard Electric Guitar", "Musical Instruments", 1299.99, 5),
        ("12 Rules for Life: An Antidote to Chaos, By Jordan B. Peterson", "Books", 12.99, 100),
        ("Ray-Ban Men's RB3548N Hexagonal Sunglasses", "Clothing and Accessories", 129.99, 25),
        ("Cuisinart Cast Iron Casserole", "Home and Kitchen", 69.99, 15),
        ("Wicker Chair", "Furniture", 49.99, 10);
