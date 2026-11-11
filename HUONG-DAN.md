# Website Khoa Toán học – HUSC

## Dành cho người cập nhật nội dung

Mở thư mục `admin`, **nháy đúp file `index.html`** (bằng Microsoft Edge hoặc Google Chrome),
rồi bấm nút **"Hướng dẫn"** ở góc trên bên phải.

Toàn bộ hướng dẫn nằm trong trang đó: đăng bài, sửa cán bộ, tải lên máy chủ bằng FileZilla,
sửa menu, xử lý sự cố.

## Dành cho người kỹ thuật

- Web tĩnh (HTML/CSS/JS thuần), không cần build, triển khai bằng cách chép file lên máy chủ (FTP/FileZilla).
- `data/data.json`: bài viết, chia theo chuyên mục `tin-tuc`, `thong-bao`, `hoc-bong`, `doan-hoi`.
- `data/staff.json`: cán bộ (`staff_data`).
- `js/layout.js`: header, menu, footer dùng chung, được chèn vào mọi trang lúc tải.
- `js/app.js`: đọc JSON và hiển thị; chuyển trang chỉ thay phần `<main id="main-content">`.
- `admin/index.html`: trang quản trị chạy trên máy (dùng File System Access API của Edge/Chrome)
  để ghi trực tiếp vào thư mục website; ảnh được thu nhỏ và chuyển sang JPG ngay trên trình duyệt.
- Thêm chuyên mục mới: thêm vào `CATEGORIES` trong `js/app.js` **và** `admin/index.html`,
  thêm mục vào `MENU` trong `js/layout.js`.
- Xem thử trên máy: `python -m http.server 8000` trong thư mục website rồi mở http://localhost:8000
