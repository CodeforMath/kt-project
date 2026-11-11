# Hướng dẫn cập nhật website Khoa Toán học – HUSC

Website là trang tĩnh (HTML/CSS/JS), không cần cơ sở dữ liệu hay máy chủ riêng.
Tin tức và danh sách cán bộ được lưu trong các file `.json` trong thư mục `data/`.

## Cấu trúc thư mục

| Đường dẫn | Nội dung | Ai hay sửa |
|---|---|---|
| `data/data.json` | Toàn bộ bài viết (tin tức, thông báo, học bổng, Đoàn – Hội) | Người đăng bài |
| `data/staff.json` | Danh sách cán bộ, giảng viên | Văn phòng khoa |
| `graph/` | Tất cả hình ảnh | Người đăng bài |
| `admin/index.html` | Công cụ thêm / sửa / xóa bài viết | Người đăng bài |
| `js/layout.js` | Menu, đầu trang, chân trang (dùng chung cho mọi trang) | Khi đổi menu / liên hệ |
| `index.html` | Trang chủ | Ít khi |
| `pages/*.html` | Các trang giới thiệu, đào tạo, bộ môn... | Ít khi |
| `js/app.js`, `css/style.css` | Mã xử lý và giao diện | Người có kiến thức web |

---

## 1. Đăng bài viết mới

1. **Chuẩn bị ảnh**: đặt tên file không dấu, không khoảng trắng, ví dụ `tin-tuc-000006.jpg`,
   `tin-tuc-000006-1.jpg`... rồi chép vào thư mục `graph/`.
   Nên giảm dung lượng ảnh xuống dưới ~500 KB (rộng khoảng 1200–1600px) để web tải nhanh.
2. **Mở công cụ quản trị**: vào `https://<địa-chỉ-website>/admin/` (hoặc mở `admin/index.html`).
   - Nếu trang báo không đọc được dữ liệu, kéo thả file `data/data.json` vào ô được chỉ dẫn.
3. Bấm **"Viết bài mới"**, điền chuyên mục, ngày, tiêu đề, tên ảnh đại diện, tóm tắt và nội dung.
   - Gõ nội dung như bình thường, **mỗi dòng là một đoạn văn**.
   - Dùng các nút **B / I / Chèn ảnh / Chèn link / Danh sách** nếu cần.
   - Khung **Xem trước** bên phải cho thấy bài sẽ hiển thị ra sao.
4. Bấm **"Lưu bài"**, rồi bấm **"Tải data.json"**.
5. Chép file `data.json` vừa tải về **đè lên** `data/data.json` của website, rồi đưa lên máy chủ
   (xem mục 5).

Sửa hoặc xóa bài cũ làm tương tự: bấm **Sửa** / nút thùng rác, rồi **Tải data.json** và chép đè.

> ⚠️ Thay đổi trong trang quản trị **chưa có hiệu lực** cho đến khi bạn chép file `data.json` mới lên website.

### Sửa trực tiếp file `data.json` (nếu cần)

Mỗi bài viết có dạng:

```json
{
  "id": "tin-tuc-000005",
  "title": "Tiêu đề bài viết",
  "date": "28/08/2026",
  "image": "./graph/tin-tuc-000005.jpg",
  "excerpt": "Tóm tắt 1–2 câu",
  "content": "<p>Đoạn 1</p><p>Đoạn 2</p>"
}
```

- `date` ghi theo dạng **ngày/tháng/năm**. Bài mới nhất tự động lên đầu trang chủ.
- `id` không được trùng nhau.
- Các bài cách nhau bằng dấu phẩy `,` — thiếu hoặc thừa dấu phẩy sẽ làm hỏng toàn bộ tin tức.
  Có thể kiểm tra file tại <https://jsonlint.com> trước khi đưa lên.

## 2. Thêm / sửa thông tin cán bộ

Mở `data/staff.json`, sao chép một khối `{ ... }` của người có cùng vai trò rồi sửa lại:

- `id`: mã không dấu, không trùng (vd. `ts-nguyen-van-a`) — cũng nên dùng làm tên ảnh `graph/ts-nguyen-van-a.jpg`.
- `type`: `giang-vien` hoặc `van-thu`.
- `department`: `toan-ly-thuyet`, `toan-ung-dung` hoặc `xac-suat-thong-ke`.
- `roles` (vai trò, có thể để trống `[]`):
  `ban-chu-nhiem` + `truong-khoa` / `pho-truong-khoa`, `truong-bo-mon`,
  `tl-sau-dai-hoc`, `tl-to-chuc-nckh`, `tl-giao-vu`, `tl-ctsv-dbcl`, `van-thu`.

Trang **Đội ngũ cán bộ**, **Cơ cấu tổ chức** và trang chi tiết giảng viên tự cập nhật theo file này.

## 3. Sửa menu hoặc chân trang

Mở `js/layout.js`:

- Mảng `MENU` ở đầu file: thêm / bớt / đổi tên mục menu.
- Mảng `FOOTER`: địa chỉ, email, số điện thoại, liên kết.

Chỉ cần sửa một lần, tất cả các trang đều thay đổi theo.

## 4. Thêm một trang mới

1. Sao chép một trang có sẵn trong `pages/` (ví dụ `tong-quan.html`) và đổi tên.
2. Sửa `<title>` và phần nội dung nằm giữa `<main id="main-content">` và `</main>`.
   **Không xóa** các dòng `<script ... layout.js ...>` và `app.js`.
3. Thêm link tới trang mới vào `MENU` trong `js/layout.js`.

## 5. Đưa thay đổi lên website

Nếu web được đặt trên GitHub Pages:

- **Cách đơn giản**: vào repository trên github.com → mở thư mục (vd. `data/`) →
  **Add file → Upload files** → chọn file mới → **Commit changes**. Sau 1–2 phút web sẽ cập nhật.
- **Dùng git**: `git add .` → `git commit -m "Đăng bài ..."` → `git push`.

Nếu trang không đổi ngay, nhấn **Ctrl + F5** để tải lại không dùng bộ nhớ đệm.

## 6. Xem thử trên máy tính trước khi đưa lên

Mở trực tiếp file `index.html` bằng trình duyệt sẽ **không** hiện tin tức (trình duyệt chặn đọc file `.json`).
Hãy chạy một máy chủ nhỏ trong thư mục website:

```bash
python -m http.server 8000
```

rồi mở <http://localhost:8000>. (Hoặc dùng tiện ích **Live Server** của VS Code.)
