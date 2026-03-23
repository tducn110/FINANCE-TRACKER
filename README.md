# Final Project: Behavioral Finance & Mascot System

## 1. Project Overview
Dự án được phát triển dựa trên nền tảng **Tâm lý học hành vi (Behavioral Psychology)** kết hợp với công nghệ quản lý tài chính. Hệ thống ứng dụng Mascot (linh vật) để tương tác và thúc đẩy người dùng duy trì thói quen quản lý tài chính cá nhân hiệu quả thông qua các cơ chế phần thưởng và nhắc nhở thông minh (S2S Logic Engine).

## 2. Used Tools
- **Backend Environment:** Node.js
- **Framework:** Express.js (RESTful API architecture)
- **Database:** MySQL (ACID Transactions supported)
- **Authentication:** JWT (JSON Web Tokens) & Joi Validation
- **Security:** Helmet, bcrypt
- **Version Control:** Git & GitHub (Agile/Ticket-based Workflow)

## 3. How to Run

### Requirements
- Node.js (v16+ recommended)
- MySQL Server

### Installation Steps
1. Khởi tạo cơ sở dữ liệu:
   - Mở MySQL Workbench, chạy file `server/database.sql` để tạo schema và tables.
2. Cài đặt các dependencies:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường (`.env`):
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=yourpassword
   DB_NAME=finance_db
   JWT_SECRET=your_jwt_secret_key
   ```
4. Khởi chạy server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 4. Entity Relationship Diagram (ERD)
*(Thêm ảnh chụp ERD từ MySQL Workbench vào đây)*
![ERD Diagram](./docs/erd.png)

---
*Developed for Stage 1 / Sprint Submission.*
