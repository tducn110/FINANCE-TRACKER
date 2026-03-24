# 🚀 PROJECT SYNTHESIS & BACKEND DEMO 2 (24/03/2026)

**Phase:** Backend Finalization & Readiness for Client Integration

---

## 1. Cơ chế hoạt động của Database (Database Core Mechanics)
Toàn bộ hệ thống hiện đang vận hành trên **MySQL (InnoDB Engine)** để đảm bảo tính **ACID** (Atomicity, Consistency, Isolation, Durability). 
- **Cấu trúc 6 bảng:** `users`, `user_settings`, `categories`, `transactions`, `fixed_costs`, `goals`.
- **Luồng dữ liệu:** Bảng `users` đóng vai trò là "Trái tim" (Root node). Mọi bảng khác đều gắn `FOREIGN KEY` trỏ về `users.id` với thuộc tính `ON DELETE CASCADE`. Điều này nghĩa là nếu một tài khoản bị xóa, toàn bộ rác (hóa đơn, mục tiêu, cấu hình) của người đó sẽ bị bốc hơi theo ngay lập tức.
- **Tính trọn vẹn (Relational Integrity):** Bảng `transactions` bắt buộc phải có `category_id` chiếu sang bảng `categories` gốc, ngăn chặn chi tiêu "ma".

---

## 2. Ứng dụng Lập trình Hướng đối tượng (OOP Application)
OOP tạo nên một bộ khung thép cho Backend này:
- **Kế thừa (Inheritance):** File `BaseModel.js` chứa các SQL queries chung (như `findById`, `findAll`). Tất cả các Model khác (`Transaction.js`, `Goal.js`...) đều `extends BaseModel`. Điều này giúp code **DRY**.
- **Tính đóng gói (Encapsulation):** Mọi logic thao tác Data bị giấu hoàn toàn trong Model. Controller chỉ gọi `Goal.updateSaved()`.

---

## 3. Cấu trúc dữ liệu & Truy vấn (DSA: Truy vấn & Quản lý)
- **Truy vấn DB (SQL Indexes):** Việc tính toán S2S Engine đòi hỏi phải quét qua hàng nghìn Record giao dịch để `SUM()`. Bằng cách gắn **Composite Indexes** vào bảng `transactions(user_id, category_id)`, độ phức tạp đã giảm từ **O(N) (Full Table Scan)** xuống **O(log N)**.
- **In-memory Hash Map (Cache Layer):** `FinanceService.js` sử dụng cấu trúc `Map()` của Javascript (Hash Map) để lưu trữ kết quả tính toán S2S. Truy xuất trạng thái tài chính chỉ mất **O(1)**.

---

## 4. Các Thuật toán Cốt lõi (Algorithms for Core Solutions)
1. **S2S Engine (Safe-to-Spend Algorithm):**
   ```text
   S2S = MonthlyBalance - (Unpaid Fixed Bills + Monthly Goals Contribution + Emergency Buffer)
   ```
2. **Regex NLP Parser (Thuật toán Bóc tách Ngôn ngữ):**
   ```regex
   /^(\d+(?:\.\d+)?)([kK]?)\s+(.+)$/
   ```
   *Quét "50.5k cafe" -> Tách số, nhân k=1000, lấy note.*
3. **Future Impact Calculator (Thuật toán Định lượng):**
   ```text
   Delayed Days = Math.ceil(Expense Amount / (Monthly Savings / 30))
   ```

---

## 5. Clean Code Guarantee
- **Strict Architecture:** Tuân thủ triệt để "Fat Service, Skinny Controller". 
- **Null Safety:** Sử dụng Toán tử Coalescing (`?? 0`) trong JS và `COALESCE(..., 0)` trong SQL để chặn đứng mọi khả năng trả về `NaN` ở Frontend.
- **Constant Sync:** Mọi ID/Numbers rủi ro đều được gom vào `/constant/index.js`.

---

## 6. STAGE OVERVIEW (24/3/2026 - Demo 2 Backend API)
Dự án đã chạm mốc **Backend Greenlight**. Backend API hiện tại 100% sạch lỗi Syntax. 7 API endpoints đã sẵn sàng kết nối React Frontend.

---

## 7. Rủi ro Dữ liệu tạm thời & Bug Logic (Temporary Data & Bugs)
- **Tesseract OCR Uploads:** File ảnh đẩy vào `/uploads` để quét chữ. Nếu Node.js crash giữa lúc đang quét ảnh, thư mục này sẽ sinh rác và làm **Tràn Ổ Cứng Server**.
- **Negative S2S Boundary:** Nếu S2S tụt xuống mức âm (Nợ tiền), logic chia `<daysLeft>` của Mascot có thể bị đảo ngược. Đã chốt lại bằng cờ `isOverBudget` boolean.
- **Stale Data:** Nếu Hacker vào DB tự Insert tay thay vì xúi API, Hash Map Cache sẽ không biết và Frontend vẫn sẽ bị "Dữ liệu ươn" trong 5 phút.

---

## 8. Các Rủi ro Bảo mật Có Thể Xảy Ra (Security Risks)
1.  **Memory Leak via Hash Map:** Cái `s2sCache` là một Object lưu trong RAM của Node. Cứ mỗi user sẽ tốn vài kilobyte. Nếu hàng triệu users -> Sập RAM Server (Out of Memory).
2.  **JWT Secret:** Biến `JWT_SECRET` đang tĩnh. Nếu sếp mất file `.env`, hacker sẽ ký token giả mạo bất kỳ ai.
3.  **Race Conditions (Nghẽn cổ chai):** Nếu user click đúp 10 lần nút "Giao dịch" cực nhanh, có khả năng Database sẽ bị trừ tiền gấp 10 lần trước khi API kịp phản hồi. 

---

## 9. Đề xuất Mở rộng Hệ thống (Scalability / Real Deployment)
**NẾU DEPLOY THỰC TẾ & KHÁCH HÀNG VÀO ĐÔNG:**
- **Database Scale:** Đưa MySQL lên **AWS RDS** (Master ghi, Slaves đọc). Cache S2S phải giật ra khỏi Memory của Node và ném vào một **Redis Cluster** độc lập.
- **Server Load Balancing:** Chạy nhiều Replica Node.js sau một **Nginx Load Balancer** hoặc K8s. 
- **Message Queue cho OCR:** `Tesseract.recognize` đang **Block Event Loop** (Chặn luồng xử lý Node). Lượng xử lý AI cao phải đẩy vào một Background Worker qua RabbitMQ/Kafka.

---

## 10. Tổng thể Bảo mật Hiện tại (Current Overall Security)
- **Rate Limiting & Helmet:** Đỡ brute-force tấn công và chống XSS Injection.
- **Joi Validation:** Mọi rác rưởi gửi lên bằng Postman/cURL sẽ bị Gateway (Joi) bóp gãy trả về 400 Bad Request ngay.
- **Bcrypt Hashing:** Xóa hoàn toàn nguy cơ rò rỉ Plaintext Password của User.
