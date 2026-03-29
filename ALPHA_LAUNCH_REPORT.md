# 🚀 S2S FINANCE TRACKER - ALPHA LAUNCH REPORT

**Phiên bản:** 10.0.0-alpha (Edge & Serverless Ready)  
**Ngày phát hành:** Tháng 3/2026  
**Dành cho:** 50 Người dùng Alpha Tester đầu tiên

---

## 🌟 TỔNG QUAN (OVERVIEW)
Chào mừng bạn đến với chương trình Alpha Test của **S2S (Safe-to-Spend) Finance Tracker**. Đây không phải là một ứng dụng ghi chép thu chi thông thường, mà là một **Trợ lý Tài chính Hành vi (Behavioral Finance)** giúp bạn không bao giờ tiêu lạm vào các khoản cố định.

Hệ thống đã được tái cấu trúc (Refactor) toàn diện trên nền tảng Serverless Hono.js và TiDB Cloud, đảm bảo tốc độ phản hồi cực nhanh và bảo mật dữ liệu cấp độ Enterprise.

---

## 🔥 4 TÍNH NĂNG CHẤT NHẤT TRONG BẢN ALPHA NÀY

### 1. 🛡️ Cơ Chế "Safe-To-Spend" (Hạch Toán Ngầm)
- Bạn tổng thu nhập 15 triệu, nhưng tiền trọ, mạng, điện (Fixed Costs) mất 4 triệu, tiền dành cho dồn mua Macbook (Goals) mất 2 triệu. 
- S2S Engine sẽ trừ đi tất cả tiền "Nợ/Hứa phải trả" ngay lập tức, trả lại cho bạn con số **Số dư An toàn**.
- *"Đừng nhìn vào tài khoản ngân hàng, hãy chỉ nhìn vào số Safe-To-Spend."*

### 2. ⚡ Nhập Liệu Thần Tốc (Smart Command NLP)
- Không cần mất 5 bước bấm chọn danh mục rườm rà.
- Bạn chỉ cần bấm vào thanh Quick Add: gõ **"50k phở"** hoặc **"tiền điện 300k"**. AI NLP Bi-directional Regex sẽ tự động bóc tách số tiền, gán danh mục và trừ vào số dư ngay lập tức.

### 3. 🎯 Quản Lý Mục Tiêu Bằng "Sát Thương" (Impact Alert)
- Mỗi khi bạn chuẩn bị chi tiêu một món tiền vô bổ, hệ thống sẽ cảnh báo món tiền này sẽ làm cho các mục tiêu (như mua điện thoại, du lịch) bị **lùi lại bao nhiêu ngày**.

### 4. 🗄️ Bảo Toàn Lịch Sử (Soft Delete)
- Thay vì xóa dữ liệu vĩnh viễn, bạn chỉ đang "ẩn" chúng đi (Soft Delete). Lịch sử tài chính của bạn luôn được giữ lại nguyên vẹn và an toàn 100% trên TiDB Cloud.

---

## 🛠️ HƯỚNG DẪN TEST DÀNH CHO BẠN (50 ALPHA TESTERS)

Chúng tôi cần bạn "phá" hệ thống này trong 7 ngày tới. Hãy làm những việc sau:
1. **Đăng nhập** bằng tính năng Auto-Login hoặc tạo tài khoản mới.
2. Cố tình nhập sai cú pháp ở thanh **Quick Add** (ví dụ: gõ "mua trà sữa hết 65000" xem hệ thống có hiểu không).
3. Đặt một mục tiêu mua sắm lớn, sau đó tiêu xài hoang phí để xem **Cảnh báo Sức bền (Impact Alert)** có hiện lên không.

---

## 🔗 THÔNG TIN TRUY CẬP & BÁO LỖI

- **Link Trải Nghiệm (Vercel):** *URL Vercel sẽ tự động sinh sau khi Push GitHub.*
- **Tài khoản Demo (Tuỳ chọn):** `demo@s2s.vn` / Pass: `123456`
- **Báo lỗi:** Nếu gặp màn hình trắng hoặc chữ báo "Serverless Timeout", vui lòng liên hệ ngay với ban quản trị hoặc chụp ảnh lại.

***Cảm ơn bạn đã trở thành một phần của dự án kiến tạo thói quen chi tiêu thông minh! 🚀***
