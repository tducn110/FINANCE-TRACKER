# 📋 BIÊN BẢN HỌP KIỂM ĐỊNH KIẾN TRÚC & UX (STAGE 2)

**Thời gian:** 24/03/2026  
**Chủ đề:** Mổ xẻ Logic, Truy vấn DB, và Trải nghiệm Người dùng (UX) trước khi code Frontend.  
**Tham gia:** PM (Product Manager), BE (Backend Dev), FE (Frontend Dev), QA (Tester), và **DT (Design Thinker - Chuyên gia Hành vi & UX)**.

---

## 🛑 BÀN LUẬN 1: Bẫy Trải Nghiệm & Cảm Xúc (Được khởi xướng bởi DT)
**🗣️ Design Thinker (DT):** 
"Tôi vừa xem logic của Mascot (`getDailyStatus`). Nếu user tiêu vượt `dailyLimit`, Mascot sẽ khóc (`CRYING`). Nhưng khoan! Nếu user là sinh viên nghèo, tiền ăn mỗi ngày mặc định đã vượt mức an toàn thì sao? Mascot khóc liên tục 30 ngày? Dưới góc nhìn Kinh tế học Hành vi, điều này tạo ra **Sự né tránh tiêu cực (Ostrich Effect)**. User sẽ chán nản, sợ hãi và *xóa app* thay vì đối mặt với hóa đơn. Chúng ta cần 'Grace Period' (Thời gian châm chước) hoặc 'Encouragement Mode' (Chế độ động viên) chứ không răn đe cực đoan!"

**🗣️ PM:** 
"Point rất hay! App của mình là 'Behavioral Finance' chứ không phải 'Kẻ đòi nợ'. BE, ông sửa logic này được không?"

**🗣️ Backend (BE):** 
"Được. Tên biến hiện tại `mascotEmotion='CRYING'` nghe hơi tiêu cực. Tôi đề xuất đổi tên biến thành `mascotState` (Cảnh báo, Động viên, Bình thường) thay vì áp đặt Emotion. Về logic DB, tôi sẽ phải viết thêm một bảng theo dõi `streak` (chuỗi ngày tiết kiệm). Nếu user đang âm tiền nhưng hôm nay tiêu ít hơn hôm qua -> Trả về Mascot Động viên (Khích lệ sự tiến bộ)."

---

## 🛑 BÀN LUẬN 2: Lỗ hổng Truy vấn Database (Được khởi xướng bởi QA)
**🗣️ Tester (QA):** 
"Khoan đã BE! Tôi vừa review cái hàm `getTotalIncome()` trong `Transaction.js`. Ông viết:
`WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`
Ông có biết khi bọc Cột `created_at` trong cái hàm `MONTH()` của MySQL, thì toàn bộ **cái Index `idx_transactions_user_date` ông tạo sẽ BỊ VÔ HIỆU HÓA không?** (Performance Anti-pattern: Function on Indexed Column). Thay vì O(log n), nó đang cào Full Table Scan đấy!"

**🗣️ Backend (BE):** 
"Chết dở! Cảm ơn QA đã tinh mắt. Nếu DB lên 1 triệu record là query này đứt gánh. 
*Giải pháp:* Tôi sẽ đổi câu query thành tìm Range thời gian chặt chẽ: 
`WHERE created_at >= '2026-03-01 00:00:00' AND created_at < '2026-04-01 00:00:00'`. Như vậy DB Engine sẽ dùng được B-Tree Index đi thẳng vào nhánh của tháng này."

---

## 🛑 BÀN LUẬN 3: Xung đột API & Giao diện (Được khởi xướng bởi FE)
**🗣️ Frontend (FE):** 
"Mọi người ơi, cái Regex NLP thần tốc `/^(\d+(?:\.\d+)?)([kK]?)\s+(.+)$/` của Backend đang có lỗ hổng luồng (User flow). Nó bắt user phải nhập **[Số tiền] + [Ghi chú]** (VD: `50k cafe`). Nhưng theo thói quen tự nhiên của người Việt, họ hay gõ **[Ghi chú] + [Số tiền]** (VD: `cafe 50k` hoặc `ăn sáng 30.5k`). Cái Regex hiện tại sẽ `null` luôn và quăng lỗi 400! Trải nghiệm nhập liệu bị gãy!"

**🗣️ Design Thinker (DT):** 
"Tôi tán thành với FE! Mục tiêu của ta là *Giảm Ma Sát (Frictionless)*. Đừng ép người dùng học cách gõ của máy, máy phải tự hiểu cách người dùng gõ."

**🗣️ Backend (BE):** 
"Ok, ghi nhận! Điểm này tôi thiết kế hơi cứng nhắc (Hardcoded pattern). Tôi sẽ update file `regexHelper.js` để hỗ trợ Bidirectional (Bắt đa chiều): Cứ thấy số + đuôi 'k' ở bất kỳ đâu trong chuỗi thì bóc ra làm `amount`, phần Text còn lại ném vào `note`."

---

## 🛑 BÀN LUẬN 4: Lỗ hổng Logic S2S (Được khởi xướng bởi PM & DT)
**🗣️ PM:** 
"Tôi check file `user_settings` có dòng `income_date INT DEFAULT 1`. Nghĩa là mặc định nhận lương ngày 1 mỗi tháng. Logic cấu hình này chỉ dùng cho dân văn phòng. Vậy nếu tệp khách hàng của ta là Freelancer (nhận tiền lắt nhắt không cố định) hoặc người bán hàng online thì sao?"

**🗣️ Backend (BE):** 
"Đúng là schema cấu hình hiện đang bị 'Office-worker Bias' (Thiên vị dân văn phòng). Đối với Freelancers, `income_date` trở nên vô nghĩa. Tệ hơn, nếu họ gán `income_date = 1` nhưng tiền về ngày 15, cái S2S Engine sẽ báo họ 'Đang nợ tiền' suốt 15 ngày đầu tháng."

**🗣️ Design Thinker (DT):** 
"Freelancers quản lý tiền theo **Biến động Dự kiến (Expected Cashflow)** thay vì Lương cứng. Đề xuất đổi cấu trúc DB: 
- Bỏ cột `income_date` cứng. 
- Thay bằng cấu hình `budget_cycle` (Chu kỳ: Hàng tháng / Tự do / Tuần). S2S Engine phải động theo Chu kỳ này."

**🗣️ Frontend (FE):** 
"Vậy lúc tôi vẽ UI phần Settings, tôi sẽ phải thêm một cái Toggle 'Loại hình thu nhập'. Backend nhớ cập nhật Joi Schema cho API Update Settings nhé, không là tôi truyền `cycle="freelance"` BE lại báo lỗi 400!"

---

## 💡 TỔNG HỢP ACTION ITEMS (HƯỚNG ĐI TIẾP THEO)
Buổi họp kết thúc bằng sự đồng thuận cao. Kiến trúc thô đã có, nhưng để app "Sống Thực Tế" và lấy 1.0 điểm hoàn hảo, Team thống nhất đập-xây-lại nhẹ các phần sau (Sprint 2):

1. **[Backend] Fix SQL Index:** Cập nhật lại toàn bộ file `Transaction.js`, bỏ hàm `MONTH()` trong mệnh đề `WHERE` để tối ưu hóa O(log N).
2. **[Backend] Update NLP Regex:** Viết lại `regexHelper.js` để đọc được ngôn ngữ cả 2 chiều (`50k cafe` VÀ `cafe 50k`).
3. **[Design & Backend] Nâng cấp Mascot Logic:** Bổ sung logic "Biên độ châm chước" vào S2S. Nếu S2S âm, nhưng có xu hướng giao dịch chi tiêu ít đi -> Đổi Mascot sang Động viên.
4. **[Frontend] Tích hợp loading States:** Vì API OCR bóc Text Tesseract mất khoảng 2-4 giây, FE phải thiết kế màn hình `Shimmer Loading` để User không thoát app.
5. **[Database Schema] Nhánh Freelancer:** Cập nhật lại `user_settings` để phân loại người dùng Cố định (Fixed Income) và Tự do (Variable Income).

---
*Biên bản được ghi nhận bởi: Antigravity - AI Tech PM.*
