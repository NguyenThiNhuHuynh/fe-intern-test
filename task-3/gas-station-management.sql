--------------------------CREATE DATABASE--------------------------
-- Tạo database quản lý trạm xăng
CREATE DATABASE GasStationDB;

-- Sử dụng database
USE GasStationDB;

--------------------------CREATE TABLE--------------------------
-- Bảng trạm xăng
CREATE TABLE GasStations (
    station_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng hàng hóa
CREATE TABLE Products (
    product_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trụ bơm
CREATE TABLE Pumps (
    pump_id INT PRIMARY KEY,
    station_id INT NOT NULL,
    product_id INT NOT NULL,
    code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pump_station FOREIGN KEY (station_id) REFERENCES GasStation(station_id),
    CONSTRAINT fk_pump_product FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

-- Bảng giao dịch
CREATE TABLE Transactions (
    transaction_id INT PRIMARY KEY,
    station_id INT NOT NULL,
    pump_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    transaction_time TIMESTAMP NOT NULL,
    CONSTRAINT fk_transaction_station FOREIGN KEY (station_id) REFERENCES GasStation(station_id),
    CONSTRAINT fk_transaction_pump FOREIGN KEY (pump_id) REFERENCES Pump(pump_id),
    CONSTRAINT fk_transaction_product FOREIGN KEY (product_id) REFERENCES Product(product_id)
);



--------------------------INSERT DATA--------------------------
-- Bảng trạm xăng
INSERT INTO GasStations(station_id, name, address, phone) VALUES
(1, 'Station A', '123 Main St', '0909123456'),
(2, 'Station B', '456 Second St', '0909765432');

-- Bảng hàng hóa
INSERT INTO Products(product_id, name, type, price, unit) VALUES
(1, 'Gasoline 95', 'Fuel', 23000.00, 'liter'),
(2, 'Diesel', 'Fuel', 21000.00, 'liter'),
(3, 'Engine Oil 1L', 'Oil', 150000.00, 'bottle'),
(4, 'Gasoline E5', 'Fuel', 22000.00, 'liter'),
(5, 'Diesel Premium', 'Fuel', 22500.00, 'liter'),
(6, 'Engine Oil 5L', 'Oil', 700000.00, 'bottle'),
(7, 'Lubricant Grease', 'Oil', 120000.00, 'tube'),
(8, 'AdBlue', 'Additive', 15000.00, 'liter');

-- Bảng trụ bơm
INSERT INTO Pumps(pump_id, station_id, product_id, code) VALUES
(1, 1, 1, 'P01'),  
(2, 1, 2, 'P02'),  
(3, 2, 1, 'P01'), 
(4, 2, 3, 'P02'), 
(5, 1, 4, 'P03'),
(6, 1, 5, 'P04'),
(7, 2, 4, 'P03'),
(8, 2, 6, 'P04');

-- Bảng giao dịch
INSERT INTO Transactions(transaction_id, station_id, pump_id, product_id, quantity, total_amount, transaction_time) VALUES
(1, 1, 1, 1, 20.0, 460000.00, '2025-08-24 08:30:00'),
(2, 1, 2, 2, 15.0, 315000.00, '2025-08-24 09:00:00'),
(3, 2, 3, 1, 30.0, 690000.00, '2025-08-24 10:15:00'),
(4, 2, 4, 3, 2.0, 300000.00, '2025-08-24 11:00:00'),
(5, 1, 5, 4, 25.0, 550000.00, '2025-08-24 12:00:00'),
(6, 1, 6, 5, 10.0, 225000.00, '2025-08-24 12:30:00'),
(7, 2, 7, 4, 40.0, 880000.00, '2025-08-24 13:00:00'),
(8, 2, 8, 6, 1.0, 700000.00, '2025-08-24 13:30:00'),
(9, 1, 1, 1, 30.0, 690000.00, '2025-08-25 08:00:00'),
(10, 2, 3, 1, 20.0, 460000.00, '2025-08-25 09:15:00');



--------------------------DATA QUERY--------------------------
-- Lấy tất cả giao dịch của 1 trạm trong khoảng ngày. 
-- Giả sử station_id = 1, từ ngày '2025-08-24' đến '2025-08-25'
SELECT *
FROM Transactions
WHERE station_id = 1
  AND transaction_time BETWEEN '2025-08-24 00:00:00' AND '2025-08-25 23:59:59'
ORDER BY transaction_time;

-- Tổng doanh thu theo ngày cho 1 trụ bơm
-- Giả sử pump_id = 1
SELECT 
    DATE(transaction_time) AS transaction_date,
    SUM(total_amount) AS daily_revenue
FROM Transactions
WHERE pump_id = 1
GROUP BY DATE(transaction_time)
ORDER BY transaction_date;

-- Tổng doanh thu theo ngày cho 1 trạm
-- Giả sử station_id = 1
SELECT 
    DATE(transaction_time) AS transaction_date,
    SUM(total_amount) AS daily_revenue
FROM Transactions
WHERE station_id = 1
GROUP BY DATE(transaction_time)
ORDER BY transaction_date;

-- Lấy top 3 hàng hóa bán chạy nhất và tổng số lít tại một trạm trong tháng
-- Giả sử station_id = 1, tháng 08/2025
SELECT 
    p.name AS product_name,
    SUM(t.quantity) AS total_quantity_sold
FROM Transactions t
JOIN Products p ON t.product_id = p.product_id
WHERE t.station_id = 1
  AND EXTRACT(YEAR FROM t.transaction_time) = 2025
  AND EXTRACT(MONTH FROM t.transaction_time) = 8
GROUP BY p.name
ORDER BY total_quantity_sold DESC
LIMIT 3;

