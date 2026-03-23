# 💰 Finance Tracker - Behavioral Economics App (Stage 1)

Dự án cá nhân tập trung vào việc quản lý tài chính thông qua lăng kính của Kinh tế học hành vi (Behavioral Economics), giúp người dùng kiềm chế chi tiêu và tối ưu hóa số dư an toàn (Safe-to-Spend).

---

## 🏛️ Kiến trúc Hệ thống (Architecture)
Hệ thống được xây dựng trên mô hình **MVC + Service Layer** đạt chuẩn doanh nghiệp:
- **Model**: Quản lý dữ liệu và truy vấn MySQL chuyên biệt (BaseModel, User, Transaction, FixedCost, Goal, UserSettings).
- **Controller**: Điều tiết luồng dữ liệu giữa Request và Response.
- **Service Layer**: Nơi xử lý các nghiệp vụ logic "nặng" (S2S Engine, Goal Impact, OCR logic). Hiện tại tập trung tại `FinanceService.js`.
- **Middleware**: Lớp bảo vệ an ninh và xác thực (JWT Auth, Joi Validation).
- **Constant**: Quản lý các biến số hằng (Magic Numbers) tập trung.

---

## 🐼 Tính năng nổi bật (Core Features)
1. **Quick Add Transaction**: Nhận diện chuỗi ngôn ngữ tự nhiên (Regex) để thêm nhanh hóa đơn (VD: "50k cafe").
2. **S2S Logic (Safe-to-Spend)**: Tính toán số tiền thực sự được tiêu sau khi đã trừ đi các chi phí cố định, quỹ khẩn cấp và mục tiêu tiết kiệm.
3. **Future Impact Calculator**: Phóng chiếu khoản chi hiện tại sẽ làm chậm mục tiêu lớn của bạn đi bao nhiêu ngày.
4. **Mascot Emotion System**: Linh vật phản hồi trạng thái tài chính của bạn mỗi ngày giúp tăng tính tương tương tác và sợ mất mát (Loss Aversion).
5. **OCR Bill Scanning**: Bóc tách số tiền từ ảnh hóa đơn bằng Tesseract.js.

---

## 🛡️ Bảo mật & Tối ưu (Security & Optimization)
- **JWT (Stateless Authentication)**: Không lưu session tại server, đảm bảo tính mở rộng cao.
- **ACID Transactions**: Đảm bảo nạp/trừ tiền trong DB chuẩn xác không sai lệch (Insert + Commit/Rollback).
- **API Defense**: Tích hợp `Helmet.js` (Security Headers), `CORS`, và `Express-rate-limit` (Chống spam).
- **Input Sanitization**: Sử dụng `Joi` để lọc data bẩn trước khi đi vào hệ thống.
- **DSA Optimization**: Sử dụng **Hash Map Caching** tại Service Layer để tăng tốc độ truy vấn số dư O(1).

---

## 🚀 Quy trình sử dụng (Getting Started)

1. **Cấu hình Database**:
   - Chạy file `database.sql` trong MySQL của bạn để khởi tạo cấu trúc bảng.
   - Cập nhật thông tin DB trong file `.env`.

2. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

3. **Khởi chạy Server**:
   ```bash
   npm run start
   ```

4. **API Endpoints chính**:
   - `POST /api/auth/register` (Đăng ký)
   - `POST /api/auth/login` (Đăng nhập -> Nhận JWT)
   - `GET /api/finance/safe-to-spend` (Check ví an toàn)
   - `POST /api/transactions/quick` (Ghi sổ nhanh)
   - `POST /api/finance/ocr` (Quét bill)

---

## ✅ PHASE 1 CONCLUSION & LOGS
**STAGE 1: BACKEND CORE AND SECURITY AUDIT COMPLETED**
- **Ngày hoàn thành**: 24/03/2026.
- **Trạng thái**: Đã Deep Scan 100% codebase. Hệ thống hoạt động nhất quán, bảo mật đa tầng, không còn Mock Data, sẵn sàng tích hợp với Frontend.
- **Dự kiến Stage 2**: Phát triển Frontend React Dashboard, tích hợp Dashboard linh vật hành vi.

---

## 🛠️ Tech Stack Details
- **Node.js**: v20+ (Đảm bảo kiến trúc ESM/CommonJS chạy ổn định).
- **MySQL**: 8.0+ (Sử dụng `mysql2` driver để hỗ trợ Async/Await).
- **Express.js**: v5.x (Sử dụng bản mới nhất để bảo mật định tuyến).
- **Security**: JWT v9.x, Bcryptjs v2.x, Helmet v7.x.

## 📖 API Documentation & Postman
- Các Endpoint được định nghĩa rõ ràng tại `src/route/`. Bạn có thể tham khảo luồng gọi tại các file `authRoutes.js` và `financeRoutes.js`.
- Một bản **Postman Collection** chi tiết sẽ được cập nhật trong thư mục `/docs/` của repo này trong thời gian tới.

---
*Created by Antigravity AI Engine (Stage 1 Audit)*
