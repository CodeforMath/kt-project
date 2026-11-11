# Website Khoa Toán học – HUSC

## Dành cho người cập nhật nội dung

Mở trang quản trị: gõ **địa chỉ website + `/admin/`** (hoặc nháy đúp file `admin/index.html`).
Trang có 3 tab: **Bài viết**, **Cán bộ** và **Hướng dẫn** — mọi hướng dẫn chi tiết nằm trong tab Hướng dẫn.

Tóm tắt: sửa nội dung trên trang quản trị → bấm **"Tải về các file đã thay đổi"** →
dùng **FileZilla** kéo các file đó lên đúng thư mục (`data/`, `graph/`) trên máy chủ.

## Dành cho người kỹ thuật

- Web tĩnh (HTML/CSS/JS thuần), không cần build, triển khai bằng cách chép file lên máy chủ (FTP/FileZilla).
- `data/data.json`: bài viết, chia theo chuyên mục `tin-tuc`, `thong-bao`, `hoc-bong`, `doan-hoi`.
- `data/staff.json`: cán bộ (`staff_data`).
- `js/layout.js`: header, menu, footer dùng chung, được chèn vào mọi trang lúc tải.
- `js/app.js`: đọc JSON và hiển thị; chuyển trang chỉ thay phần `<main id="main-content">`.
- `admin/index.html`: đọc `../data/*.json`, chỉnh sửa trên trình duyệt, xuất file JSON và ảnh
  (ảnh được thu nhỏ, chuyển JPG, đặt tên theo mã bài / mã cán bộ). Không ghi được gì lên máy chủ,
  nên đặt trên web công khai vẫn an toàn.
- Thêm chuyên mục mới: thêm vào `CATEGORIES` trong `js/app.js` **và** `admin/index.html`,
  thêm mục vào `MENU` trong `js/layout.js`.
- Xem thử trên máy: `python -m http.server 8000` trong thư mục website rồi mở http://localhost:8000
