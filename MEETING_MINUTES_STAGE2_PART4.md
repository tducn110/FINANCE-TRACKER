# 📋 BIÊN BẢN HỌP 1:1 — SENIOR PM BÁO CÁO CTO (BUỔI 4)

**Thời gian:** 24/03/2026 (Phiên đặc biệt — Báo cáo trực tiếp Sếp)  
**Hình thức:** 1-on-1 giữa **Senior PM** và **CTO (Sếp)**  
**Chủ đề:** Tổng duyệt toàn bộ hệ thống Backend — Giải trình từng file, từng decision, và Đề xuất cải tiến dựa trên 3 buổi họp vừa qua.

---

## PHẦN A: HỆ THỐNG ĐANG VẬN HÀNH NHƯ THẾ NÀO

### 🗣️ Senior PM:
"Thưa Sếp, tôi xin báo cáo toàn diện. Tôi đã scan toàn bộ 16 file source code, đọc từng dòng, và tổng hợp lại cho Sếp bức tranh toàn cảnh. Tôi sẽ đi theo đúng luồng dữ liệu (Data Flow) mà một Request từ khách hàng đi qua khi chạm vào Backend của chúng ta."

---

### 📂 FILE 1: `app.js` — Cánh cổng duy nhất vào hệ thống
**Vì sao nó được thiết kế như vậy?**
Đây là file Entry Point (Điểm khởi động). Mọi Request từ Browser/Postman đều phải đi qua đây trước. Tôi đã gắn 3 lớp khiên (Shield) vào ngay cổng vào:
- `helmet()` — Tự động gắn HTTP Headers chống XSS/Clickjacking. Sếp không cần hiểu kỹ thuật, chỉ cần biết: Nếu không có dòng này, hacker có thể nhúng mã độc vào trang web của mình.
- `cors()` — Cho phép React Frontend (chạy ở cổng 5173) gọi sang Backend (cổng 3000). Nếu tắt dòng này, Frontend sẽ bị trình duyệt chặn cứng.
- `rateLimit()` — Giới hạn 100 request trong 15 phút. Nếu hacker hoặc bot spam API, hệ thống tự động ném ra lỗi 429 và từ chối phục vụ.

**Ý kiến cá nhân PM:** File này đã đạt chuẩn Production. Tuy nhiên, cái Global Error Handler ở dòng 35 hiện chỉ `console.error`. Tôi đề xuất trong tương lai gắn thêm **Sentry.io** (Hệ thống theo dõi lỗi từ xa). Khi Sếp ngủ mà Server gặp bug, Sentry sẽ gửi email/SMS cho Team ngay lập tức. Nhưng với quy mô Demo hiện tại, `console.error` là quá đủ.

---

### 📂 FILE 2: `db.js` — Trái tim kết nối với Database
**Vì sao nó được thiết kế như vậy?**
File này dùng **Connection Pool** (Bể kết nối), không phải kết nối đơn lẻ. Mỗi lần API cần hỏi Database, nó "mượn" 1 kết nối từ bể, xong việc thì "trả lại". Giống như hệ thống cho mượn xe đạp công cộng: 10 xe phục vụ 100 người, không cần mua 100 xe.

**Vì sao không kết nối trực tiếp (Single Connection)?** Nếu 20 người cùng gọi API S2S cùng lúc mà chỉ có 1 kết nối, 19 người còn lại phải xếp hàng. Connection Pool (giới hạn 10) cho phép 10 query chạy song song, giảm thời gian chờ xuống 10 lần.

**Vì sao lại có block kiểm tra `requiredEnv`?** Trước đây, file này có chứa mật khẩu mặc định (fallback password) hardcode trong code. Nếu ai đó quên tạo file `.env`, hệ thống sẽ tự động dùng mật khẩu mặc định và kết nối vào DB. Đây là lỗ hổng bảo mật cực kỳ nguy hiểm. Giờ tôi đã bỏ fallback, thay bằng việc hệ thống sẽ TỰ SẬP (exit code 1) ngay lập tức nếu thiếu bất kỳ biến nào. "Thà chết còn hơn chạy sai."

---

### 📂 FILE 3: `database.sql` — Bản thiết kế Nhà Kho (Schema)
**Vì sao lại có 6 bảng?**
- `users`: Chứa danh tính (Username + Bcrypt Hash). Không lưu mật khẩu gốc.
- `categories`: 7 loại chi tiêu cố định (Income, Food, Drink...). Dùng `ENUM type` để phân biệt thu/chi. **Vì sao tách bảng riêng thay vì hardcode?** Vì nếu ngày mai Sếp muốn thêm loại "Du lịch" hoặc "Y tế", chỉ cần INSERT thêm 1 dòng vào bảng này, không cần sửa code.
- `user_settings`: Cá nhân hóa S2S Engine (Ngày lương, Quỹ khẩn cấp, Ngân sách tháng). **Vì sao tách ra khỏi `users`?** Vì đây là nguyên tắc **Tách bảng theo Tần suất Truy cập**: Bảng `users` chỉ đọc khi Login (1 lần/phiên), nhưng `user_settings` đọc mỗi lần tính S2S (có thể 50 lần/ngày). Gộp chung sẽ kéo cả khối data đăng nhập vào mỗi truy vấn tài chính, tốn RAM.
- `transactions`: Sổ nhật ký tài chính. Mỗi dòng = 1 giao dịch. **Vì sao có `category_id` gắn FK sang `categories`?** Để không ai có thể INSERT mã phân loại ma (VD: category_id = 999 - không tồn tại). DB Engine sẽ chặn ngay.
- `fixed_costs`: Hóa đơn cố định hàng tháng (tiền trọ, điện, nước). **Vì sao tách ra khỏi `transactions`?** Vì bản chất khác nhau. Transaction là "Đã chi", Fixed Cost là "Sẽ phải chi". S2S Engine cần trừ "Tiền sẽ phải chi" TRƯỚC khi báo cho user biết còn bao nhiêu được phép tiêu.
- `goals`: Mục tiêu tiết kiệm dài hạn. Có `status ENUM('active','completed','paused')` để S2S Engine chỉ tính những goal đang hoạt động.

**Vì sao dùng InnoDB?** Vì đây là Engine duy nhất của MySQL hỗ trợ ACID Transactions (BEGIN/COMMIT/ROLLBACK) và Foreign Keys. Nếu dùng MyISAM: Nhanh hơn 5% ở đọc, nhưng mất Relational Integrity hoàn toàn. Với app tài chính, đó là "Mất tiền với mất uy tín" — Không đánh đổi được.

**Vì sao có block `DROP TABLE IF EXISTS`?** Đây là bài học xương máu từ chính dự án này. Trước đây chỉ dùng `CREATE IF NOT EXISTS`. Khi team thay đổi schema (thêm cột, thêm FK), việc chạy lại file SQL không có tác dụng gì vì MySQL thấy bảng cũ còn nguyên và bỏ qua. Dẫn đến Workbench có 5 bảng nhưng `database.sql` mô tả 6 bảng. **Sự không đồng nhất giữa "Bản vẽ" và "Ngôi nhà thật"** chính là thứ đã gây ra lỗi thiếu bảng `categories` mà Sếp gặp.

---

### 📂 FILE 4: `BaseModel.js` — Bộ xương OOP
**Vì sao phải có Abstract Class?** Nếu không có BaseModel, mỗi file Model (Transaction, Goal, FixedCost...) đều phải tự viết lại hàm `findById`, `findAll`, `delete` — 4 file x 3 hàm = 12 hàm trùng lặp. BaseModel gom tất cả vào 1 nơi, các Model con chỉ cần `extends BaseModel` là có sẵn mọi thứ. Đây là nguyên tắc OOP **DRY (Don't Repeat Yourself)** và **Open-Closed Principle** (Mở để mở rộng, đóng để sửa đổi).

**Lưu ý kỹ thuật:** Hàm `delete()` ở dòng 39 hiện đang dùng `DELETE FROM` thật (Hard Delete). Theo biên bản Buổi 2, chúng ta đã thống nhất cần chuyển sang Soft Delete. Tuy nhiên với quy mô Demo hiện tại, PM quyết định giữ nó lại vì chưa có giao diện "Xóa tài khoản" trên Frontend. Khi nào FE code nút Xóa, BE sẽ đồng bộ sửa sang `UPDATE SET is_deleted = 1`.

---

### 📂 FILE 5: `Transaction.js` — Sổ Cái Tài Chính
**Vì sao `create()` phải có ACID?** Khi ghi 1 giao dịch, chỉ có 2 kịch bản chấp nhận được: Thành công 100% hoặc Thất bại 100%. Không có chuyện ghi nửa vời (ghi tiền nhưng không ghi category). `beginTransaction()` → `commit()` → hoặc `rollback()` đảm bảo điều đó.

**Vì sao `getTotalIncome()` scope theo tháng?** Đây là quyết định chiến lược của team: S2S Engine phải phản ánh "Sức khỏe tài chính của THÁNG NÀY", không phải "Tổng cộng từ ngày đầu dùng app". Nếu user dùng app 12 tháng, tổng thu nhập/chi tiêu all-time sẽ lên tới hàng trăm triệu → S2S hiển thị vô nghĩa.

**⚠️ Concern kỹ thuật (Từ biên bản Buổi 1 — QA phát hiện):** Truy vấn hiện tại dùng `MONTH(created_at)` bọc quanh cột indexed. Điều này khiến MySQL phải quét toàn bất bảng (Full Table Scan) thay vì dùng được Index B-Tree. Với vài trăm record của Demo thì không nhận thấy. Nhưng nếu lên Production 1 triệu record, query sẽ chậm gấp 100 lần.

---

### 📂 FILE 6: `FixedCost.js` — Hóa đơn cố định
**Vì sao `markAsPaid()` cần ACID?** Vì nó liên quan đến chuyển trạng thái tài chính. Nếu quá trình UPDATE lỗi giữa chừng (VD: mất mạng DB), kết quả sẽ ở trạng thái lơ lửng: Hóa đơn đánh dấu "Đã trả" nhưng thực tế chưa ghi nhận. ACID bảo toàn: Hoặc UPDATE xong hết, hoặc quay về trạng thái cũ.

**⚠️ Concern (Từ Buổi 2 — DT phát hiện):** Cột `is_paid BOOLEAN` quá đơn giản. Nó chỉ có 2 trạng thái (Trả rồi / Chưa trả), không có trạng thái "Quá hạn" (Overdue). Team đã thống nhất ở Buổi 3 rằng sẽ giữ Boolean cho Demo, nhưng chừa không gian nâng cấp lên ENUM khi có Frontend.

---

### 📂 FILE 7: `Goal.js` — Mục tiêu tiết kiệm
**Vì sao `updateSaved()` có logic auto-complete?** Khi user bỏ tiền vào heo, hệ thống tự kiểm tra: Nếu `current_saved >= target_amount` → Tự động đổi status thành `completed`. Đây là bài toán tối ưu: Thay vì bắt Frontend phải gọi thêm 1 API riêng để "Đánh dấu hoàn thành", Backend tự xử lý ngay trong cùng 1 Transaction ACID. Giảm 1 roundtrip mạng.

---

### 📂 FILE 8: `UserSettings.js` — Bảng cá nhân hóa
**Vì sao `createDefault()` được gọi ngay khi Register?** Trước đây, user mới đăng ký xong gọi API S2S sẽ bị lỗi `Cannot read property 'emergency_buffer' of undefined` vì chưa có dòng settings nào. Giờ hệ thống auto-insert 1 dòng mặc định (`buffer=0, income_date=1, budget=0`) ngay khi tạo tài khoản. User mới vào app → S2S chạy ngay mượt mà.

---

### 📂 FILE 9: `FinanceService.js` — Bộ não S2S
**Vì sao lại tách riêng thành Service Layer?** Đây là triết lý "Fat Service, Skinny Controller". Controller không được chứa Logic tính toán. Nếu Controller vừa nhận Request, vừa tính toán, vừa trả Response → vi phạm **Single Responsibility Principle**. Khi cần sửa công thức S2S, Dev chỉ cần vào đúng 1 file `FinanceService.js` thay vì lục tung 5 file Controller.

**Vì sao có Hash Map Cache?** Công thức S2S cần query 4 bảng (transactions, fixed_costs, goals, user_settings). Nếu user refresh Dashboard 10 lần trong 1 phút, DB sẽ bị đánh 40 queries. Hash Map Cache lưu kết quả trong RAM 5 phút (CACHE_TTL = 300,000ms). Trong 5 phút đó, 10 lần refresh chỉ tốn 1 lần query thật + 9 lần đọc RAM (O(1)).

**Vì sao dùng `new Map()` mà không dùng Object `{}`?** Map có hiệu năng tốt hơn Object khi key là số (userId), và hỗ trợ `.has()`, `.delete()` native. Đây là lựa chọn DSA có chủ đích.

---

### 📂 FILE 10: `financeController.js` — Bảng điều khiển API
**Vì sao auto-categorize bằng keywords?** Regex NLP Parser chỉ trả về `{amount, note}`. Hệ thống phải tự phân loại note vào Category. Logic hiện tại: Nếu note chứa "cafe" → Drink, chứa "cơm" → Food, chứa "xăng" → Transport. Nếu không khớp gì → mặc định OTHER (ID=7). **Vì sao mặc định là OTHER chứ không phải FOOD hay SAVINGS?** Vì nếu mặc định SAVINGS, mọi giao dịch không phân loại được sẽ bị hệ thống ghi nhận là "Tiết kiệm", làm sai lệch kết quả S2S hoàn toàn.

**Mascot Logic:** `getDailyStatus()` chia S2S còn lại cho số ngày còn lại trong tháng để ra `dailyLimit`. Nếu user tiêu vượt 150% dailyLimit → Mascot Crying. Ngưỡng 150% (DANGER_MULTIPLIER=1.5) được rút từ file `constant/index.js`, không hardcode.

---

### 📂 FILE 11: `authController.js` — Cổng Xác Thực
**Vì sao Login trả về lỗi chung "Sai tên đăng nhập hoặc mật khẩu"?** Đây là chuẩn bảo mật OWASP: Không bao giờ cho biết "Username đúng nhưng password sai" hay "Username không tồn tại". Vì nếu trả về cụ thể, hacker sẽ biết username nào tồn tại trong hệ thống để brute-force.

**Vì sao Register kiểm tra trùng Username trước khi Hash?** Vì `bcrypt.hash()` tốn ~250ms (10 salt rounds). Nếu username đã tồn tại, việc Hash trước rồi mới kiểm tra là lãng phí CPU 250ms cho mỗi request trùng. Kiểm tra trước, Hash sau — Tiết kiệm tài nguyên.

---

### 📂 FILE 12: `regexHelper.js` — Bộ dịch ngôn ngữ tự nhiên
**Vì sao Regex lại là giải pháp tốt nhất cho NLP nhẹ?** Có 2 lựa chọn: (A) Dùng thư viện AI NLP (compromise.js, natural.js) — nặng 5MB, chậm 200ms mỗi request. (B) Dùng 1 dòng Regex — 0 dependency, xử lý trong 0.01ms. Với bài toán đơn giản "Bóc số + Bóc chữ", Regex là "Xe Honda bền bỉ" phù hợp nhất.

**⚠️ Concern (Từ Buổi 1 — FE phát hiện):** Regex hiện tại chỉ bắt mẫu `[Số] [Chữ]` (50k cafe). Không bắt được `[Chữ] [Số]` (cafe 50k). Team đã ghi nhận, chờ Sprint 2 để mở rộng.

---

### 📂 FILE 13: `constant/index.js` — Bảng hằng số
**Vì sao phải gom mọi con số vào đây?** Nếu `CATEGORY.INCOME = 1` xuất hiện trực tiếp trong 3 file (Transaction.js, financeController.js, FinanceService.js), khi Sếp muốn đổi ID Income từ 1 sang 10, Dev phải sửa 3 nơi và cầu nguyện không quên nơi nào. Gom vào 1 file → Sửa 1 chỗ → Đồng bộ toàn hệ thống.

---

## PHẦN B: ĐỀ XUẤT CẢI TIẾN (Dựa trên 3 Action Items từ Buổi 3)

### 🗣️ Senior PM:
"Thưa Sếp, dựa trên 3 buổi họp vừa qua và việc scan toàn bộ source code, đây là đề xuất cá nhân của tôi:"

---

### Đề xuất 1: Sửa SQL Anti-pattern (Action Item #1 từ Buổi 1)
**Tình trạng hiện tại:** `getTotalIncome()` và `getTotalExpense()` dùng `MONTH(created_at)` bọc quanh cột indexed → Vô hiệu hóa Index.

**Đề xuất (Phù hợp quy mô Demo):** Đổi sang Range query `WHERE created_at >= ? AND created_at < ?` bằng cách tính sẵn ngày đầu/cuối tháng trong JavaScript trước khi ném vào SQL. Không cần cài thêm thư viện gì. Code thuần JS xử lý Date là đủ. Chi phí: 0. Hiệu quả gấp 100 lần khi data lớn. **Đây là lốp Honda đúng cỡ.**

---

### Đề xuất 2: Mở rộng Regex hai chiều (Action Item #2 từ Buổi 1)
**Tình trạng hiện tại:** Chỉ chấp nhận `50k cafe`, không chấp nhận `cafe 50k`.

**Đề xuất (Phù hợp quy mô Demo):** Viết thêm 1 Regex thứ 2 dạng `/^(.+)\s+(\d+(?:\.\d+)?)([kK]?)$/`. Hàm `parseQuickInput` chạy Regex 1 trước, nếu không match thì chạy Regex 2. Không cần AI NLP, chưa cần compromise.js. Đây là chiêu **"Thử Pattern A, không match thì fallback Pattern B"**. Chi phí: 3 dòng code. Lốp Honda vừa khít.

---

### Đề xuất 3: Interface hóa Cache & OCR (Action Item #3 từ Buổi 3)
**Tình trạng hiện tại:** `FinanceService` gọi thẳng `this.s2sCache.get()`. Nếu mai mốt đổi sang Redis, phải sửa từng dòng trong Service.

**Đề xuất (Phù hợp quy mô Demo):** Tạo 1 class `CacheAdapter` với 2 method: `async get(key)` và `async set(key, value, ttl)`. Bên trong vẫn dùng Map() cho Demo. Khi scale lên Redis, chỉ cần swap nội dung bên trong CacheAdapter, **FinanceService không cần sửa 1 chữ nào.** Tương tự cho OCR: Bọc Tesseract vào `OcrAdapter`. Sau này đổi sang Google Vision API hay AWS Textract, Controller vẫn nguyên xi. Đây là **Strategy Pattern** — Lốp Honda nhưng đã chừa sẵn trục bánh cho Ferrari.

---

## PHẦN C: Ý KIẾN CÁ NHÂN CỦA PM

### 🗣️ Senior PM:
"Thưa Sếp, với tư cách Senior PM, tôi đánh giá hệ thống Backend hiện tại đạt **8/10** cho mốc Demo. Kiến trúc MVC + Service Layer rất sạch. OOP Inheritance đúng chuẩn. ACID Transactions bảo toàn dữ liệu tài chính.

Hai điểm còn thiếu để lên 10/10:
1. **Sửa SQL Anti-pattern** (Ước tính 30 phút code).
2. **Regex hai chiều** (Ước tính 15 phút code).

Đây là 2 con bug "Ngủ đông" — Hiện tại không ảnh hưởng gì, nhưng khi Frontend nối vào và user bắt đầu nhập liệu thật, chúng sẽ thức dậy.

Tôi đề xuất: **Fix 2 con bug này TRƯỚC khi bắt tay vào Frontend**, vì nếu Frontend đã code xong rồi mới phát hiện API trả về kết quả sai do SQL chậm hoặc Regex gãy, chi phí sửa sẽ gấp 5 lần (phải sửa cả Backend LẪN Frontend).

Kính chờ quyết định của Sếp."

---

*Biên bản ghi nhận bởi Senior PM — Phiên họp 1:1 với CTO.*
