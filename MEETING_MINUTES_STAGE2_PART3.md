# 📋 BIÊN BẢN HỌP KIẾN TRÚC & TỐI ƯU HÓA (BUỔI 3 - CHỐT PHƯƠNG ÁN)

**Thời gian:** 24/03/2026 (Phiên tối)  
**Chủ đề:** Đánh đổi Kiến trúc (Architectural Trade-offs) - Lắp lốp xe cho đúng cỡ và Chốt mốc Demo.  
**Tham gia:** Senior PM, BE Lead, FE Lead, QA/Tester, Design Thinker (Tất cả đều là Senior Level).

---

## 🛑 BÀN LUẬN 1: Nút thắt cổ chai OCR (Tesseract)
**🗣️ BE Lead:** 
"Hàm OCR bằng Tesseract.js hiện tại tốn khoảng 3-5 giây để phân tích bill. Tôi đã thiết kế xong bản Architecture mới: Tách Tesseract ra một Microservice chạy bằng Python, giao tiếp qua RabbitMQ (Message Queue). Khi user upload ảnh, API trả về HTTP 202 (Accepted) ngay trong 50ms, sau đó FE dùng WebSockets để nhận kết quả khi OCR chạy xong."

**🗣️ Design Thinker (DT):** 
"Hoàn hảo về mặt UX! User sẽ không thấy màn hình bị đơ (frozen) trong 5 giây, họ có thể lướt app trong lúc chờ bill được quét."

**🗣️ Senior PM:** 
"Giải pháp của BE và UX của DT đạt cực hạn của độ hoàn hảo (The Ferrari Engine). Nhưng anh em lưu ý: Đây là Stage 2 (Bản Demo). Việc dựng thêm 1 container RabbitMQ và 1 WebSocket Server sẽ tốn x3 tài nguyên server (RAM/Disk) trên gói Free-tier. 
👉 **Quyết định (Minimize):** Chúng ta sẽ giữ cách **Old-school (Chờ đồng bộ - Synchronous)**. Tuy nhiên, BE phải bọc cái logic OCR vào một Interface/Class riêng biệt (`IOcrService`). FE khắc phục UX bằng cách bật UI `Skeleton Loading / Scanning Animation`.
*Kết quả:* Ta chạy động cơ Honda cho hiện tại, nhưng đã chừa sẵn con ốc để sau này vặn động cơ Ferrari vào mà không phải đập đi xây lại."

---

## 🛑 BÀN LUẬN 2: In-Memory Cache vs Redis Cluster
**🗣️ QA / Tester:** 
"Tôi đánh giá rất cao cấu trúc Hash Map (`s2sCache`) O(1) của BE. Tuy nhiên, nếu tuần tới PM quyết định scale server chạy 4 instances (PM2 Cluster) để chịu tải, cái Cache In-Memory này sẽ bị phân mảnh (Memory Fragmentation). User query trúng Node 1 thì có data mới, query trúng Node 2 thì lấy data cũ (Stale Data)."

**🗣️ BE Lead:** 
"Chính xác. Đoạn logic Redis Cluster tôi đã code xong ở branch `feature/redis`. Chỉ cần merge vào là xong."

**🗣️ Senior PM:** 
"Rất chuyên nghiệp! Tuy nhiên, dự án hiện tại chưa có Traffic (Lượng truy cập) thật. Gắn Redis bây giờ là 'Over-engineering' (Làm quá mức cần thiết). 
👉 **Quyết định (Minimize):** Vẫn dùng In-Memory Cache (ES6 Map) cho mốc Demo để tiết kiệm chi phí Server. **Nhưng**, BE phải sửa toàn bộ hàm `cache.get()` và `cache.set()` thành hàm Bất đồng bộ (`async / Promise`). 
*Lý do:* Để sau này khi ráp Redis vào, Interface trả về Promise giữ nguyên, Controller không cần phải sửa dù chỉ 1 dòng code. Cách ly hoàn toàn sự thay đổi!"

---

## 🛑 BÀN LUẬN 3: Xử lý Phantom Deduction & Soft Delete
**🗣️ Design Thinker (DT):** 
"Nhắc lại bài toán Buổi 2: User không muốn bị trừ tiền tự động (Phantom Deduction) cho hóa đơn cố định chưa trả, và muốn có Grace Period (Lưu trữ 30 ngày) cho tài khoản đã xóa."

**🗣️ BE Lead:** 
"Để giải quyết triệt để và minh bạch 100% về tài chính, tôi đề xuất áp dụng **Event Sourcing Pattern**. Nghĩa là Database không lưu 'Trạng thái hiện tại', mà lưu 'Lịch sử Hành động' (Event Append-Only). Lịch sử không bao giờ bị xóa cứng (Hard Delete), mà chỉ có Event `ACCOUNT_DELETED`. Nó giải quyết cả 2 bài toán của DT và QA."

**🗣️ Senior PM:** 
"Event Sourcing là 'Chén thánh' (Holy Grail) của Fintech, Stripe và Momo đều dùng nó. Giải pháp của BE là Masterclass! Nhưng để Setup EventStoreDB hay Kafka cho một Database 6 bảng thì chúng ta sẽ trễ Deadline nộp Demo mất 2 tuần.
👉 **Quyết định (Old school but Gold):** Chúng ta sẽ dùng cách 'Nhà quê' nhưng thực dụng nhất: 
1. Thêm cột `status (PENDING, PAID, OVERDUE)` vào Fixed Costs.
2. Thêm cột cờ `is_deleted BOOLEAN` vào các bảng.
*Kết quả:* Đáp ứng đúng 100% logic UI/UX mà DT yêu cầu, qua mặt được bài test rủi ro dữ liệu của QA, và BE chỉ mất đúng 2 tiếng để update DB thay vì 2 tuần."

---

## 💡 KẾT LUẬN CUỘC HỌP
Buổi họp diễn ra cực kỳ trơn tru vì tất cả các thành viên đều có trình độ cao (Seniority) và nhìn ra được rủi ro của hệ thống. 
Tuy nhiên, dưới góc nhìn Kinh tế và Scale (Quy mô), team thống nhất: **Không lắp lốp siêu xe vào khung gầm xe máy**. 

**Action Items chốt sổ (Sprint 2):**
- BE sẽ update cấu trúc SQL theo hướng truyền thống (`status` ENUM & `is_deleted` cờ).
- BE bọc các lớp truy xuất (Cache, OCR) thành `Promise / Interface` để chừa không gian Mở rộng (Scalability Space).
- FE sẽ cover các khoảng hở UX bằng Animation / Loading UI chân thực nhất. 

*Cuộc họp kết thúc trong sự đồng thuật tuyệt đối. Backend chính thức đi vào chốt file SQL cuối cùng.*
