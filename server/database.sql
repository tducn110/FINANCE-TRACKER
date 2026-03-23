CREATE DATABASE IF NOT EXISTS finance_tracker;
USE finance_tracker;

-- Bảng 0: Người dùng (Quản lý Auth)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng 1: Lịch sử Giao dịch (Đã có, update thêm cho OCR)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    note VARCHAR(255),
    category_id INT,
    is_ocr_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng 2: Chi phí Cố định (Tiền trọ, điện nước...)
CREATE TABLE IF NOT EXISTS fixed_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL, 
    amount DECIMAL(15, 2) NOT NULL,
    due_date INT, -- Ngày phải đóng tiền hàng tháng
    is_paid BOOLEAN DEFAULT FALSE
);

-- Bảng 3: Mục tiêu Dài hạn (Laptop, Cổ phiếu...)
CREATE TABLE IF NOT EXISTS goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_saved DECIMAL(15, 2) DEFAULT 0,
    monthly_contribution DECIMAL(15, 2) NOT NULL, 
    deadline DATE,
    status ENUM('active', 'completed', 'paused') DEFAULT 'active'
);

-- Bảng 4: Cài đặt User (Ngưỡng sinh tồn)
CREATE TABLE IF NOT EXISTS user_settings (
    user_id INT PRIMARY KEY,
    emergency_buffer DECIMAL(15, 2) DEFAULT 200000, 
    income_date INT 
);

-- Chèn dữ liệu mẫu (Seeder) để test API luôn cho lẹ
INSERT IGNORE INTO user_settings (user_id, emergency_buffer, income_date) VALUES (1, 500000, 5);
INSERT IGNORE INTO fixed_costs (user_id, name, amount, due_date) VALUES (1, 'Tiền trọ', 2000000, 10);
INSERT IGNORE INTO goals (user_id, name, target_amount, monthly_contribution, deadline) 
VALUES (1, 'Mua Laptop', 45000000, 2000000, '2026-12-31');
