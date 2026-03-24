# 📋 BIÊN BẢN HỌP KIỂM ĐỊNH KIẾN TRÚC & UX (BUỔI 2)

**Thời gian:** 24/03/2026 (Phiên chiều)  
**Chủ đề:** Mổ xẻ Logic Bề Sâu - Cuộc chiến giữa Kỹ thuật, Kinh doanh và Tâm lý học.  
**Tham gia:**
- **Senior PM:** Sếp dự án, thực dụng, chốt hạ vấn đề.
- **Junior BE & Junior FE:** Lính thực thi, hay phòng thủ code của mình.
- **QA (Tester):** Sát thủ tìm diệt rủi ro hệ thống.
- **UI/UX & DT (Design Thinker):** Phe bảo vệ Tâm lý & Trải nghiệm người dùng.

---

## 🛑 BÀN LUẬN 1: Quả bom nổ chậm mang tên "Fixed Costs" (Được khởi xướng bởi QA)
**🗣️ Tester (QA):** 
"Ê Junior BE, tôi đang đọc schema bảng `fixed_costs` của ông. Có trường `due_date`, có hàm `markAsPaid()`. Nhìn thì hay đấy, nhưng ông đang **thiếu CRON Job (Tác vụ chạy ngầm)**! Nếu đến ngày mùng 5 user phải đóng tiền trọ mà họ quên bấm nút 'Đã Cầm Tiền Đi Đóng', hệ thống của ông xử lý S2S thế nào sang tháng tiếp theo? Nó tự động trừ ảo (Phantom Deduct) à?"

**🗣️ Junior BE:** 
"Sếp PM bẩu là tạm thời mình tính tổng `Fixed Costs` chưa pay rồi trừ thẳng vào S2S của tháng hiện tại thôi. Sang tháng thì gọi hàm `resetMonthly()`."

**🗣️ Design Thinker & UI/UX:** 
"Không được! Trong Kinh tế học hành vi, **Phantom Deduction (Trừ tiền dị bản)** là thứ làm user ghét nhất, vì tiền trong túi họ còn, nhưng App lại báo hết. 
Hơn nữa, nếu họ quên đóng tiền tháng này, sang tháng sau hóa đơn đó phải biến thành trạng thái `OVERDUE` (Quá hạn) và nhân đôi số nợ lên, chứ không phải `reset` sạch như chưa có gì xảy ra! Anh FE thiết kế UI cũng phải gạch đỏ cái bill đó lên để tạo cảm giác 'Đau đớn' (Pain of Paying) mồi cho họ đi thanh toán."

**🗣️ Senior PM:** 
"Bên Design nói đúng tâm lý khách hàng. Cái Boolean `is_paid = false/true` của Junior BE là tư duy quá nông. 
👉 **Chỉ đạo:** BE phải sửa cột `is_paid` thành ENUM `status ('PENDING', 'PAID', 'OVERDUE')`. Cấm xử lý tự động trừ tiền nếu user chưa xác nhận, chỉ được hiển thị ở dạng cảnh báo đỏ."

---

## 🛑 BÀN LUẬN 2: Lỗi Logic "Tiết Kiệm Cứng Bước" (Được khởi xướng bởi UI/UX)
**🗣️ UI/UX:** 
"Màn hình 'Mục Tiêu' (Goals) đang dở tệ. Junior BE thiết kế cái `monthly_contribution` (Cam kết góp mỗi tháng) là một hằng số cứng ngắc. Giả sử người ta thất nghiệp 1 tháng không bỏ heo được, tháng sau App của các anh bắt họ bù gấp đôi? Nhìn vào cái UI báo nợ tiền tiết kiệm, người ta thà xóa app!"

**🗣️ Junior FE:** 
"Công nhận! Thằng BE đẩy API ra làm UI của em hiển thị số ngày lùi mục tiêu (Delayed Days) giãn ra thành vô cực (Infinity) khi user chia cho số 0 lúc họ không nạp tiền. Em bắt lỗi mỏi tay."

**🗣️ Design Thinker (DT):** 
"Chúng ta cần linh hoạt hóa. Triết lý của tiết kiệm hiện đại là **Safe-to-Save (Khuyến nghị tích lũy)** chứ không phải **Hard Debt (Khoản nợ cứng)**. Nếu tháng này họ nghèo, App phải an ủi: *'Không sao, tháng này nghỉ tiết kiệm cũng được'*."

**🗣️ Senior PM:** 
"Duyệt. Junior BE, bỏ ngay suy nghĩ bắt user phải nộp tiền tiết kiệm đúng hạn như ngân hàng đi. Đổi logic S2S: Tiền tiết kiệm (`Goals`) sẽ được trừ đi CUỐI CÙNG sau khi đã trừ phí sinh hoạt. Còn dư thì mới khuyên, không dư thì thôi! FE nhớ vẽ con Mascot lướt sóng nhẹ nhàng cho vụ này."

---

## 🛑 BÀN LUẬN 3: Lỗi Mất Dữ Liệu Không Thể Cứu Vãn (Được khởi xướng bởi QA)
**🗣️ Tester (QA):** 
"Senior PM ơi, anh để lính của anh code SQL ngây thơ quá. Cái bảng `users`, `transactions`, `goals` toàn gắn `ON DELETE CASCADE`. Tức là nếu User dỗi ấn 'Xóa Tài Khoản', toàn bộ lịch sử 3 năm dòng tiền của họ bốc hơi khỏi Server trong 1 phần ngàn giây. Thế lỡ họ ấn nhầm thì sao? Hoặc AI lỡ Report nhầm acc thì sao? Ở công ty Fintech, mất 1 dòng Transaction là đi tù đấy!"

**🗣️ Junior BE:** 
"Thì chuẩn Database là phải Cascade để đỡ dọn rác mồ côi (Orphan rows) mà..."

**🗣️ Senior PM:** 
"Sai bét! Ở môi trường doanh nghiệp tài chính, KHÔNG BAO GIỜ được dùng `DELETE FROM`. Mọi thứ phải là **Soft Delete (Xóa mềm)**. 
👉 **Chỉ đạo:** Junior BE vào thêm ngay cột `is_deleted BOOLEAN DEFAULT 0` và `deleted_at TIMESTAMP NULL` vào các bảng cốt lõi. Giao diện FE khi user ấn xóa, thực chất chỉ gán `is_deleted = 1` và Logout ra. Database phải giữ nguyên toàn bộ data ít nhất 30 ngày để làm thủ tục khôi phục (Grace period) hoặc Analytics."

---

## 💡 TỔNG QUAN QUYẾT ĐỊNH (Ký bởi Senior PM)
Chưa đụng vào Code vội. Các Junior BE/FE cầm ngay 3 Task mới này suy nghĩ lại cấu trúc System Architecture:
1. Đập bỏ `is_paid` rập khuôn, thay bằng hệ thống State Machine cho hóa đơn (`Pending`, `Paid`, `Overdue`).
2. Tái cấu trúc cơ chế ép buộc tiết kiệm bằng mô hình linh hoạt "Có dư mới khuyên".
3. Cấm tuyệt đối Hard Delete trong DB. Chuyển lên cơ chế Soft Delete cho toàn bộ Financial Ledger.

*Biên bản treo tại đây. Yêu cầu toàn team đọc ngấm trước khi sờ tay vào gõ dòng code tiếp theo.*
