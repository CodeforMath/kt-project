/**
 * HEADER + MENU + FOOTER DÙNG CHUNG CHO TOÀN BỘ WEBSITE
 * ------------------------------------------------------
 * Muốn sửa menu hay thông tin liên hệ ở chân trang: CHỈ CẦN SỬA FILE NÀY.
 * Mọi trang (index.html và các trang trong pages/) đều tự lấy header/footer từ đây.
 *
 * Cách dùng trong một trang HTML:
 *   <script src="js/layout.js" data-part="header"></script>   (ở đầu <body>)
 *   <script src="js/layout.js" data-part="footer"></script>   (ở cuối <body>)
 * Với trang nằm trong thư mục pages/ thì đổi "js/layout.js" thành "../js/layout.js".
 */
(function () {
    // ====== 1. MENU CHÍNH — sửa ở đây ======
    // Mỗi mục: { label: 'Tên hiển thị', href: 'đường dẫn tính từ thư mục gốc' }
    // Mục có menu con thì dùng 'children' thay cho 'href'.
    const MENU = [
        { label: '<i class="fas fa-home"></i>', title: 'Trang chủ', href: 'index.html' },
        { label: '70 Năm Thành Lập Khoa', href: 'pages/70-nam-thanh-lap-khoa.html' },
        {
            label: 'Giới thiệu', children: [
                { label: 'Tổng quan', href: 'pages/tong-quan.html' },
                { label: 'Đội ngũ cán bộ', href: 'pages/doi-ngu-can-bo.html' },
                { label: 'Cơ cấu tổ chức', href: 'pages/co-cau-to-chuc.html' },
                {
                    label: 'Các bộ môn', children: [
                        { label: 'Toán lý thuyết', href: 'pages/toan-ly-thuyet.html' },
                        { label: 'Xác suất thống kê', href: 'pages/xac-suat-thong-ke.html' },
                        { label: 'Toán ứng dụng', href: 'pages/toan-ung-dung.html' }
                    ]
                }
            ]
        },
        {
            label: 'Đào tạo', children: [
                { label: 'Đào tạo đại học', href: 'pages/dao-tao-dai-hoc.html' },
                { label: 'Đào tạo sau đại học', href: 'pages/dao-tao-sau-dai-hoc.html' },
                { label: 'Tuyển sinh năm 2026', href: 'pages/tuyen-sinh-nam-2026.html' }
            ]
        },
        {
            label: 'Tin Tức & Thông báo', children: [
                { label: 'Tin tức', href: 'pages/chuyen-muc.html?type=tin-tuc' },
                { label: 'Thông báo', href: 'pages/chuyen-muc.html?type=thong-bao' },
                { label: 'Học bổng', href: 'pages/chuyen-muc.html?type=hoc-bong' },
                { label: 'Đoàn, Hội', href: 'pages/chuyen-muc.html?type=doan-hoi' }
            ]
        }
    ];

    // ====== 2. CHÂN TRANG — sửa ở đây ======
    // icon: tên biểu tượng Font Awesome (xem https://fontawesome.com/v6/search?o=r&m=free)
    // Link bắt đầu bằng http sẽ mở ở tab mới.
    const FOOTER = [
        {
            title: 'LIÊN HỆ', links: [
                { icon: 'fas fa-map-marker-alt', label: '77 Nguyễn Huệ, TP. Huế' },
                { icon: 'fas fa-envelope', label: 'maths@husc.edu.vn', href: 'mailto:maths@husc.edu.vn' },
                { icon: 'fas fa-phone', label: '(0234) 3 82 8427', href: 'tel:02343828427' },
                { icon: 'fab fa-facebook-f', label: 'Fanpage Khoa Toán', href: 'https://www.facebook.com/share/1Cx1XNmVmE/' }
            ]
        },
        {
            title: 'LIÊN KẾT NHANH', links: [
                { icon: 'fas fa-graduation-cap', label: 'Đào tạo đại học', href: 'pages/dao-tao-dai-hoc.html' },
                { icon: 'fas fa-user-graduate', label: 'Đào tạo sau đại học', href: 'pages/dao-tao-sau-dai-hoc.html' },
                { icon: 'fas fa-bullhorn', label: 'Thông tin tuyển sinh', href: 'https://tuyensinh.husc.edu.vn/nganhdaotao-dh.php?manganh=7460108' }
            ]
        },
        {
            title: 'KẾT NỐI', links: [
                { icon: 'fas fa-university', label: 'Đại học Huế', href: 'https://hueuni.edu.vn/' },
                { icon: 'fas fa-school', label: 'Trường ĐH Khoa học', href: 'https://husc.edu.vn/' }
            ]
        }
    ];

    const COPYRIGHT = '&copy; ' + new Date().getFullYear() + ' Khoa Toán - Đại học Khoa học, Đại học Huế.';
    const SLIDES = ['graph/slide1.jpg', 'graph/slide2.jpg', 'graph/slide3.jpg'];

    // ====== Phần dưới đây là mã xử lý, thường không cần sửa ======
    const script = document.currentScript;
    // Thư mục gốc của website, suy ra từ vị trí file layout.js (…/js/layout.js)
    const BASE = script.src.replace(/js\/layout\.js(\?.*)?$/, '');
    const url = (href) => (/^(https?:|mailto:|tel:|#)/.test(href) ? href : BASE + href);
    const isExternal = (href) => /^https?:/.test(href);

    function menuItem(item, level) {
        if (item.children) {
            const liClass = level === 1 ? 'has-child' : 'has-child-lvl3';
            const ulClass = level === 1 ? 'sub-menu' : 'sub-menu-lvl3';
            const arrow = level === 1 ? 'fa-chevron-down' : 'fa-chevron-right';
            return `<li class="${liClass}">
                <a href="#" role="button" aria-haspopup="true">${item.label} <i class="fas ${arrow} icon-small"></i></a>
                <ul class="${ulClass}">${item.children.map(c => menuItem(c, level + 1)).join('')}</ul>
            </li>`;
        }
        const title = item.title ? ` title="${item.title}" aria-label="${item.title}"` : '';
        return `<li><a href="${url(item.href)}"${title}>${item.label}</a></li>`;
    }

    function headerHtml() {
        return `
    <header class="husc-header">
        <div class="header-slider">
            ${SLIDES.map(s => `<div class="slide" style="background-image: url('${url(s)}');"></div>`).join('')}
        </div>
        <div class="header-overlay"></div>
        <div class="container header-content">
            <div class="logo-area">
                <a href="${url('index.html')}" class="logo-link">
                    <div class="logo-box">
                        <img src="${url('graph/logokhoa.png')}" alt="Logo Khoa Toán HUSC" class="logo-img">
                    </div>
                    <div class="logo-divider"></div>
                    <div class="logo-title">
                        <p class="university-name">TRƯỜNG ĐẠI HỌC KHOA HỌC, ĐẠI HỌC HUẾ</p>
                        <h1 class="department-name">KHOA TOÁN HỌC</h1>
                    </div>
                </a>
            </div>
            <button type="button" class="mobile-menu-toggle" aria-label="Mở menu">
                <i class="fas fa-bars"></i>
            </button>
            <nav class="husc-nav" aria-label="Menu chính">
                <ul>${MENU.map(m => menuItem(m, 1)).join('')}</ul>
            </nav>
            <div class="husc-overlay"></div>
        </div>
    </header>`;
    }

    function footerHtml() {
        const link = (l) => {
            const icon = `<i class="${l.icon}"></i> `;
            if (!l.href) return `<a>${icon}${l.label}</a>`;
            const ext = isExternal(l.href) ? ' target="_blank" rel="noopener"' : '';
            return `<a href="${url(l.href)}"${ext}>${icon}${l.label}</a>`;
        };
        return `
    <footer class="main-footer">
        <div class="container">
            <div class="grid-footer">
                ${FOOTER.map(col => `
                <div class="footer-col">
                    <h4>${col.title}</h4>
                    <div class="footer-links">${col.links.map(link).join('')}</div>
                </div>`).join('')}
            </div>
            <div class="footer-bottom">${COPYRIGHT}</div>
        </div>
    </footer>`;
    }

    // Đánh dấu mục menu đang xem (gọi lại sau mỗi lần chuyển trang)
    function setActive() {
        const here = location.pathname + location.search;
        const herePath = location.pathname.replace(/\/$/, '/index.html');
        document.querySelectorAll('.husc-nav li').forEach(li => li.classList.remove('active'));
        document.querySelectorAll('.husc-nav a[href]:not([href="#"])').forEach(a => {
            const u = new URL(a.href);
            const match = u.search ? (u.pathname + u.search === here) : (u.pathname === herePath);
            if (match) {
                // Đánh dấu cả mục cha cấp 1
                const top = a.closest('.husc-nav > ul > li');
                if (top) top.classList.add('active');
            }
        });
    }

    window.SiteLayout = { BASE, setActive };

    const part = script.dataset.part;
    if (part === 'header') {
        script.insertAdjacentHTML('beforebegin', headerHtml());
        setActive();
    } else if (part === 'footer') {
        script.insertAdjacentHTML('beforebegin', footerHtml());
    }
})();
