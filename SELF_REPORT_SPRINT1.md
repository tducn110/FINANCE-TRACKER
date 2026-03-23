# Sprint 1 Self-Report

**Tên Sinh Viên:** [Điền Tên Sinh Viên]
**Mã Sinh Viên:** [Điền Mã Sinh Viên]
**Dự Án:** S2S Behavioral Finance System
**Sprint:** 1
**Thời gian:** [Điền Ngày/Tháng]

---

## 1. Mục tiêu của Sprint (Sprint Goals)
- Khởi tạo cấu trúc dự án chuẩn Enterprise-Grade (MVC Pattern).
- Thiết kế cơ sở dữ liệu với ACID transactions.
- Tích hợp hệ thống bảo mật bằng JWT Authentication và định dạng Validate DTO (Joi).
- Xây dựng tầng Logic cốt lõi (S2S Engine) dựa trên tâm lý học hành vi (Behavioral Mascot).
- Thiết lập quy trình làm việc chuyên nghiệp với Git/GitHub (Atomic Commits, Issue Tracking).

## 2. Công việc đã hoàn thành (Completed Tasks)
- **Task 1: Setup Project Structure and MVC Pattern (Issue #1)**
  - Xây dựng kiến trúc thư mục chuẩn: `model`, `route`, `controller`, `service`.
  - Khởi tạo script SQL: `database.sql` để định nghĩa Schema và Relationships.
- **Task 2: Implement JWT Authentication and Security (Issue #2)**
  - Xây dựng middlewares xác thực Stateless JWT.
  - Bảo mật các routes bằng `helmet` và áp dụng `bcrypt` cho database.
- **Task 3: Develop S2S Logic Engine and Finance Services (Issue #3)**
  - Tách bạch logic xử lý nghiệp vụ tại Service Layer.
  - Code lõi tính toán, đồng bộ dữ liệu giao dịch kết hợp với logic thưởng/phạt hành vi Mascot.
- **Task 4: Documentation (Readme)**
  - Hoàn thiện `README.md` bao gồm: cách cài đặt, hướng dẫn khởi chạy, tổng quan lý thuyết hành vi, và ERD.
  
## 3. Quản lý source code và quy trình (Best Practices Applied)
- Sử dụng **GitHub Issues** để tạo "vé" (tickets) theo dõi tiến độ công việc trước khi gõ code.
- Áp dụng **Conventional Commits** (`feat`, `chore`, `refactor`...) và **Atomic Commits** mang tính nguyên tử cao.
- Có gắn tag đóng Ticket tự động (vd: `Closes #1`) khi thực hiện Pull/Push.
- Mã nguồn tuân thủ nguyên tắc OOP (Tính Đóng Gói) và viết Code sạch (S.O.L.I.D principles).

## 4. Khó khăn gặp phải & Cách giải quyết (Challenges & Solutions)
- **Khó khăn:** Thiết kế logic S2S đòi hỏi sự chính xác cao trong các giao dịch tài chính (tránh Race Conditions).
- **Giải quyết:** Sử dụng Database Transactions (ACID) của MySQL kèm theo việc bắt Exceptions (try-catch) toàn diện ở Service Layer thay vì Controller.
- **Khó khăn:** Quản lý lịch sử Git sao cho rành mạch và đẹp.
- **Giải quyết:** Tuân thủ chặt chẽ việc code theo từng Issue, `add` chính xác các file liên quan thay vì `git add .` toàn bộ, sau đó mới commit.

## 5. Kế hoạch cho Sprint tiếp theo (Next Steps)
- Tích hợp thêm các API mở rộng liên quan đến thống kê biểu đồ chi tiêu (Data Analytics).
- Xây dựng Unit Testing cho tầng Service.
- Triển khai CI/CD cơ bản (nếu có yêu cầu từ Stage 2).

---
*Báo cáo được viết dựa trên các tiêu chí chấm điểm của Task 1 và Task 3 (Ticket Management, Atomic Commits, Architecture).*
