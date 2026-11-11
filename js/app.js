/**
 * HUSC - Khoa Toán học: mã xử lý chung cho toàn bộ website
 * ----------------------------------------------------------
 * - Đọc tin tức từ data/data.json và cán bộ từ data/staff.json rồi hiển thị.
 * - Chuyển trang không cần tải lại toàn bộ (chỉ thay phần <main id="main-content">).
 *
 * Người cập nhật nội dung thường KHÔNG cần sửa file này:
 *   - Thêm/sửa bài viết, cán bộ -> dùng trang quản trị admin/index.html
 *     (dữ liệu nằm trong data/data.json và data/staff.json)
 *   - Sửa menu, chân trang -> sửa js/layout.js
 * Xem thêm HUONG-DAN.md.
 */

// Tên tiếng Việt của từng chuyên mục trong data/data.json.
// Muốn thêm chuyên mục mới: thêm một dòng ở đây, thêm mục vào menu (js/layout.js)
// và thêm mảng cùng tên vào data/data.json.
const CATEGORIES = {
    'tin-tuc':   { label: 'Tin tức',   title: 'TIN TỨC' },
    'thong-bao': { label: 'Thông báo', title: 'THÔNG BÁO' },
    'hoc-bong':  { label: 'Học bổng',  title: 'HỌC BỔNG' },
    'doan-hoi':  { label: 'Đoàn hội',  title: 'ĐOÀN - HỘI' }
};

// --- 1. CÁC HÀM TIỆN ÍCH DÙNG TRONG HTML ---
/**
 * Đóng/mở phần "Xem thêm"
 * @param {string} contentId - ID của khối nội dung cần ẩn/hiện
 * @param {string} btnId - ID của nút bấm tương ứng
 */
function toggleContent(contentId, btnId) {
    const content = document.getElementById(contentId);
    const btn = document.getElementById(btnId);
    if (!content || !btn) return;

    const isHidden = content.style.display === 'none' || content.style.display === '';
    content.style.display = isHidden ? 'block' : 'none';
    btn.setAttribute('aria-expanded', String(isHidden));
    btn.innerHTML = isHidden
        ? 'Thu gọn <i class="fas fa-chevron-up"></i>'
        : 'Xem thêm <i class="fas fa-chevron-right"></i>';
    if (!isHidden) btn.closest('section')?.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function () {
    const mainContent = document.getElementById('main-content');

    // --- 2. ĐƯỜNG DẪN GỐC ---
    // Lấy từ js/layout.js để chạy đúng cả khi web nằm trong thư mục con (vd. GitHub Pages)
    const REPO_PATH = window.SiteLayout
        ? new URL(window.SiteLayout.BASE).pathname
        : (location.pathname.includes('/pages/')
            ? location.pathname.split('/pages/')[0] + '/'
            : location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1));

    // ?v=... để trình duyệt luôn lấy dữ liệu mới nhất
    const STAFF_JSON = REPO_PATH + 'data/staff.json?v=' + Date.now();
    const NEWS_JSON = REPO_PATH + 'data/data.json?v=' + Date.now();

    // Ảnh dự phòng khi ảnh bài viết / ảnh cán bộ bị thiếu
    const DEFAULT_IMG = REPO_PATH + 'graph/logokhoa.png';
    const DEFAULT_AVATAR = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><rect width="100" height="120" fill="#e6ecf2"/>' +
        '<circle cx="50" cy="45" r="22" fill="#aab8c6"/><path d="M10 120c4-30 22-42 40-42s36 12 40 42z" fill="#aab8c6"/></svg>');
    const onErr = (fallback) => `onerror="this.onerror=null;this.src='${fallback}'"`;

    // "5/1/2026" -> "20260105" để sắp xếp đúng kể cả khi ngày/tháng không có số 0 đứng trước
    const formatDateForSort = (d) => {
        if (!d) return '0';
        const [day = '', month = '', year = ''] = String(d).split('/');
        return year.padStart(4, '0') + month.padStart(2, '0') + day.padStart(2, '0');
    };

    const getVNCategory = (cat) => CATEGORIES[cat]?.label || 'Thông báo';
    const detailUrl = (item) => `${REPO_PATH}pages/chi-tiet.html?type=${encodeURIComponent(item.categoryType)}&id=${encodeURIComponent(item.id)}`;
    const emptyMessage = (text) => `<p class="empty-state"><i class="far fa-folder-open"></i> ${text}</p>`;

    const getCleanImgPath = (rawPath, fallback = DEFAULT_IMG) => {
        if (!rawPath) return fallback;
        if (/^(https?:|data:)/.test(rawPath)) return rawPath;
        return REPO_PATH + rawPath.replace(/^(\.\.\/|\.\/|\/)+/, '');
    };

    // Sửa đường dẫn ảnh trong nội dung bài viết (vd. ../graph/a.jpg) cho đúng thư mục gốc
    const fixInternalHtmlPaths = (htmlString) => {
        if (!htmlString) return '';
        return htmlString.replace(/src=(['"])(?:\.\.\/|\.\/|\/)?graph\//g, `src=$1${REPO_PATH}graph/`);
    };

    // --- 3. ĐỌC & HIỂN THỊ DỮ LIỆU ---
    let newsCache = null;
    async function getNewsData() {
        if (!newsCache) {
            newsCache = fetch(NEWS_JSON).then(r => {
                if (!r.ok) throw new Error('Không đọc được data/data.json');
                return r.json();
            }).catch(e => { newsCache = null; throw e; });
        }
        return newsCache;
    }

    // Gộp mọi chuyên mục thành một danh sách, bài mới nhất đứng đầu
    async function getMergedData() {
        try {
            const data = await getNewsData();
            return Object.entries(data)
                .filter(([_, v]) => Array.isArray(v))
                .flatMap(([k, items]) => items.map(i => ({ ...i, categoryType: k })))
                .sort((a, b) => formatDateForSort(b.date).localeCompare(formatDateForSort(a.date)));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    let staffCache = null;
    async function getStaffData() {
        if (!staffCache) {
            staffCache = fetch(STAFF_JSON).then(r => {
                if (!r.ok) throw new Error('Không đọc được data/staff.json');
                return r.json();
            }).then(d => d.staff_data || [])
              .catch(e => { staffCache = null; throw e; });
        }
        return staffCache;
    }

    function createStaffCard(p, displayTitle) {
        const role = displayTitle ? `<div class="role-text">${displayTitle}</div>` : '';
        return `
            <a href="${REPO_PATH}pages/thong-tin-gv.html?id=${encodeURIComponent(p.id)}" class="staff-card-simple">
                <div class="staff-img-wrapper">
                    <img src="${getCleanImgPath(p.image, DEFAULT_AVATAR)}" alt="${p.name}" loading="lazy" ${onErr(DEFAULT_AVATAR)}>
                </div>
                ${role}
                <div class="name-text">${p.name}</div>
            </a>`;
    }

    const orgBlock = (label, inner, containerClass = 'staff-flex-container') =>
        `<div class="org-block"><div class="org-label"><span>${label}</span></div><div class="${containerClass}">${inner}</div></div>`;

    async function initStaffLogic(pageType) {
        const container = document.getElementById(pageType === 'org' ? 'org-structure-container' : 'staff-all-container');
        if (!container) return;

        try {
            const s = await getStaffData();
            let html = '';

            if (pageType === 'org') {
                const bcn = s.filter(i => i.roles?.includes('ban-chu-nhiem'));
                if (bcn.length) {
                    html += orgBlock('Ban Chủ nhiệm Khoa',
                        bcn.map(p => createStaffCard(p, p.roles.includes('truong-khoa') ? 'Trưởng khoa' : 'Phó Trưởng khoa')).join(''));
                }

                const troLyMapping = { 'tl-sau-dai-hoc': 'TL Sau đại học', 'tl-to-chuc-nckh': 'TL Tổ chức và NCKH', 'tl-giao-vu': 'TL Giáo vụ', 'tl-ctsv-dbcl': 'TL CTSV và ĐBCL', 'van-thu': 'Văn thư' };
                const listTroLy = s.filter(i => i.roles?.some(r => r.startsWith('tl-') || r === 'van-thu'));
                if (listTroLy.length) {
                    html += orgBlock('Các trợ lý', listTroLy.map(p => {
                        const r = p.roles.find(r => r.startsWith('tl-')) || 'van-thu';
                        return createStaffCard(p, troLyMapping[r] || 'Trợ lý');
                    }).join(''));
                }

                const depts = [
                    { id: 'toan-ly-thuyet', label: 'Bộ môn Toán Lý thuyết' },
                    { id: 'toan-ung-dung', label: 'Bộ môn Toán Ứng dụng' },
                    { id: 'xac-suat-thong-ke', label: 'Bộ môn Xác suất - Thống kê' }
                ];
                depts.forEach(dept => {
                    const deptStaff = s.filter(i => i.department === dept.id && i.type === 'giang-vien');
                    if (!deptStaff.length) return;
                    const leader = deptStaff.find(i => i.roles?.includes('truong-bo-mon'));
                    const members = deptStaff.filter(i => !i.roles?.includes('truong-bo-mon'));
                    html += orgBlock(dept.label, `
                        <div class="dept-leader-row">${leader ? createStaffCard(leader, 'Trưởng bộ môn') : ''}</div>
                        <div class="staff-flex-container" style="border:none;">
                            ${members.map(p => createStaffCard(p, 'Giảng viên')).join('')}
                        </div>`, 'dept-container');
                });
            } else {
                const members = s.filter(i => i.type === 'giang-vien');
                html += orgBlock('Giảng viên', members.map(p => createStaffCard(p)).join(''));

                const staff = s.filter(i => i.type === 'van-thu');
                if (staff.length) html += orgBlock('Văn thư', staff.map(p => createStaffCard(p)).join(''));
            }
            container.innerHTML = html || emptyMessage('Danh sách cán bộ đang được cập nhật.');
        } catch (e) {
            console.error(e);
            container.innerHTML = emptyMessage('Không tải được danh sách cán bộ. Vui lòng thử lại sau.');
        }
    }

    async function renderStaffDetail(id) {
        const wrapper = document.querySelector('.lecturer-profile-wrapper');
        const showNotFound = () => {
            if (wrapper) wrapper.innerHTML = emptyMessage(`Không tìm thấy thông tin giảng viên. <a href="${REPO_PATH}pages/doi-ngu-can-bo.html">Xem danh sách cán bộ</a>`);
        };
        if (!id) return showNotFound();

        try {
            const staff = await getStaffData();
            const p = staff.find(s => String(s.id) === String(id));
            if (!p) return showNotFound();

            document.title = `${p.name} - Khoa Toán HUSC`;
            const setVal = (elId, val) => {
                const el = document.getElementById(elId);
                if (el) el.innerText = val || '---';
            };

            setVal('gv-name-sidebar', p.name);
            setVal('gv-fullname', p.name);
            setVal('gv-gender', p.gender);
            setVal('gv-birthday', p.birthday);
            setVal('gv-phone', p.contact?.phone);

            const emailEl = document.getElementById('gv-email');
            if (emailEl) {
                emailEl.innerText = p.contact?.email || '---';
                emailEl.href = p.contact?.email ? `mailto:${p.contact.email}` : '#';
            }

            const imgEl = document.getElementById('gv-image');
            if (imgEl) {
                imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = DEFAULT_AVATAR; };
                imgEl.src = getCleanImgPath(p.image, DEFAULT_AVATAR);
                imgEl.alt = p.name;
            }

            const specialtyBox = document.querySelector('.specialty-content');
            const eduList = document.getElementById('gv-education-list');
            const updating = '<p style="color: #666; font-style: italic; margin-top: 10px;">Dữ liệu đang được cập nhật...</p>';

            if (p.type === 'giang-vien') {
                if (specialtyBox) {
                    specialtyBox.innerHTML = `
                        <h6 class="spec-title">1. Lĩnh vực nghiên cứu</h6>
                        <ul id="gv-research-list" class="dot-list-small">
                            ${p.research_fields?.map(f => `<li>${f}</li>`).join('') || '<li>Đang cập nhật...</li>'}
                        </ul>
                        <h6 class="spec-title">2. Kinh nghiệm giảng dạy</h6>
                        <ul id="gv-teaching-list" class="dot-list-small">
                            ${p.teaching_fields?.length
                                ? p.teaching_fields.map(f => `<li>${f}</li>`).join('')
                                : `<li>Các học phần Toán cơ bản.</li>
                                   <li>Các học phần chuyên ngành thuộc ${p.department_name || 'Toán học'}.</li>`}
                        </ul>
                        <h6 class="spec-title">3. Dữ liệu khoa học</h6>
                        <div class="science-link-wrapper">
                            ${p.science_url ? `<a id="gv-science-link" href="${p.science_url}" target="_blank" rel="noopener" class="view-more-blue">
                                <i class="fas fa-external-link-alt" style="margin-right: 8px;"></i>
                                Xem chi tiết dữ liệu khoa học của giảng viên
                            </a>` : '<p>Đang cập nhật...</p>'}
                        </div>`;
                }
                if (eduList) {
                    eduList.innerHTML = p.education?.map(e => `
                        <div class="edu-level-item" style="margin-bottom: 25px;">
                            <h5 style="color: #004a99; font-weight: 700; margin-bottom: 10px;">${e.level}</h5>
                            <ul class="custom-edu-list">
                                <li><strong>Ngành đào tạo:</strong> ${e.major}</li>
                                <li><strong>Nơi đào tạo:</strong> ${e.place}</li>
                                <li><strong>Năm tốt nghiệp:</strong> ${e.year}</li>
                            </ul>
                        </div>`).join('') || updating;
                }
            } else {
                if (specialtyBox) specialtyBox.innerHTML = updating;
                if (eduList) eduList.innerHTML = updating;
            }
        } catch (e) {
            console.error('Lỗi hiển thị giảng viên:', e);
            showNotFound();
        }
    }

    async function initHomePage() {
        const newsContainer = document.getElementById('latest-news-container');
        const noticeContainer = document.getElementById('latest-notices-container');
        if (!newsContainer || !noticeContainer) return;

        const allData = await getMergedData();
        if (!allData.length) {
            newsContainer.innerHTML = emptyMessage('Chưa có tin tức.');
            noticeContainer.innerHTML = '';
            return;
        }

        // 1. Bài mới nhất (tiêu điểm)
        const topNews = allData[0];
        newsContainer.innerHTML = `
            <div class="featured-news">
                <a href="${detailUrl(topNews)}" class="news-img-wrapper">
                    <img src="${getCleanImgPath(topNews.image)}" alt="${topNews.title}" ${onErr(DEFAULT_IMG)}>
                </a>
                <div class="news-info">
                    <span class="news-date">${topNews.date} <b style="color:#004488">[${getVNCategory(topNews.categoryType)}]</b></span>
                    <a href="${detailUrl(topNews)}" style="text-decoration:none; color:inherit;">
                        <h4 class="news-item-title">${topNews.title}</h4>
                    </a>
                    <p class="news-excerpt">${topNews.excerpt || ''}</p>
                </div>
            </div>`;

        // 2. 10 bài tiếp theo (mọi chuyên mục)
        noticeContainer.innerHTML = allData.slice(1, 11).map(i => `
            <li>
                <span class="t-dot"></span>
                <div class="t-content">
                    <span class="news-date">${i.date} <b style="color:#004488">[${getVNCategory(i.categoryType)}]</b></span>
                    <a href="${detailUrl(i)}">${i.title}</a>
                </div>
            </li>`).join('');
    }

    async function renderCategory(type) {
        const listEl = document.getElementById('category-list');
        if (!listEl) return;

        const titleEl = document.getElementById('category-title');
        const title = type === 'all' ? 'TẤT CẢ TIN TỨC & SỰ KIỆN' : (CATEGORIES[type]?.title || 'DANH MỤC');
        if (titleEl) titleEl.innerText = title;
        document.title = `${title.charAt(0)}${title.slice(1).toLowerCase()} - Khoa Toán HUSC`;

        listEl.innerHTML = '<p class="loading-text">Đang tải...</p>';
        const allItems = await getMergedData();
        const itemsToShow = type === 'all' ? allItems : allItems.filter(i => i.categoryType === type);

        if (!itemsToShow.length) {
            listEl.innerHTML = emptyMessage('Chưa có bài viết nào trong mục này.');
            return;
        }

        listEl.innerHTML = itemsToShow.map(i => `
            <div class="news-item-card">
                <a href="${detailUrl(i)}" class="news-img-box">
                    <img src="${getCleanImgPath(i.image)}" class="news-thumb" alt="${i.title}" loading="lazy" ${onErr(DEFAULT_IMG)}>
                </a>
                <div class="news-body">
                    <div class="news-meta">
                        <span class="news-date">${i.date}</span>
                        <span class="news-category-tag" style="color: #004488; font-weight: bold; margin-left: 8px;">
                            [${getVNCategory(i.categoryType)}]
                        </span>
                    </div>
                    <a href="${detailUrl(i)}" class="news-item-title">${i.title}</a>
                    <p class="news-excerpt">${i.excerpt || ''}</p>
                </div>
            </div>`).join('');
    }

    async function renderDetail(type, id) {
        const contentEl = document.getElementById('post-content');
        if (!contentEl) return;
        const titleEl = document.getElementById('post-title');
        const dateEl = document.getElementById('post-date');

        const allItems = await getMergedData();
        // Tìm đúng chuyên mục trước; nếu bài đã được chuyển sang chuyên mục khác thì tìm theo id
        const post = allItems.find(p => p.categoryType === type && String(p.id) === String(id))
                  || allItems.find(p => String(p.id) === String(id));

        if (!post) {
            if (titleEl) titleEl.innerText = 'Không tìm thấy bài viết';
            contentEl.innerHTML = emptyMessage(`Bài viết có thể đã bị gỡ hoặc đường dẫn không đúng. <a href="${REPO_PATH}pages/chuyen-muc.html?type=all">Xem tất cả tin tức</a>`);
            return;
        }

        document.title = `${post.title} - Khoa Toán HUSC`;
        if (titleEl) titleEl.innerText = post.title;
        if (dateEl) dateEl.innerHTML = `<i class="far fa-calendar-alt"></i> ${post.date || ''} &nbsp;·&nbsp; ` +
            `<a href="${REPO_PATH}pages/chuyen-muc.html?type=${post.categoryType}">${getVNCategory(post.categoryType)}</a>`;
        contentEl.innerHTML = fixInternalHtmlPaths(post.content || post.excerpt);
    }

    // --- 4. MENU TRÊN ĐIỆN THOẠI ---
    const nav = document.querySelector('.husc-nav');
    const menuBtn = document.querySelector('.mobile-menu-toggle');

    function closeMobileMenu() {
        if (!nav) return;
        nav.classList.remove('active');
        nav.querySelectorAll('.open').forEach(s => s.classList.remove('open'));
        nav.querySelectorAll('.active-parent').forEach(p => p.classList.remove('active-parent'));
        if (menuBtn) {
            const icon = menuBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
            menuBtn.setAttribute('aria-expanded', 'false');
        }
    }

    function initMobileMenu() {
        if (!menuBtn || !nav) return;
        menuBtn.setAttribute('aria-expanded', 'false');

        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = nav.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (icon) icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
            menuBtn.setAttribute('aria-expanded', String(isOpen));
        });

        // Bấm vào mục có menu con: mở/đóng menu con (chỉ trên màn hình nhỏ)
        nav.querySelectorAll('li').forEach(item => {
            const link = item.querySelector(':scope > a');
            const subMenu = item.querySelector(':scope > .sub-menu, :scope > .sub-menu-lvl3');
            if (!link || !subMenu) return;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.innerWidth > 1024) return;
                e.stopPropagation();
                item.parentElement.querySelectorAll(':scope > li.active-parent').forEach(other => {
                    if (other === item) return;
                    other.classList.remove('active-parent');
                    other.querySelector(':scope > .sub-menu, :scope > .sub-menu-lvl3')?.classList.remove('open');
                });
                const isOpening = subMenu.classList.toggle('open');
                item.classList.toggle('active-parent', isOpening);
            });
        });

        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuBtn.contains(e.target)) closeMobileMenu();
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileMenu(); });
    }

    // --- 5. CHUYỂN TRANG KHÔNG TẢI LẠI ---
    const isHomePath = (path) => path === REPO_PATH || path === REPO_PATH + 'index.html';

    // Hiển thị dữ liệu động tùy theo trang hiện tại
    async function runPageLogic() {
        const url = new URL(location.href);
        const path = url.pathname;
        const id = url.searchParams.get('id');
        const type = url.searchParams.get('type');

        if (path.endsWith('thong-tin-gv.html')) await renderStaffDetail(id);
        else if (path.endsWith('co-cau-to-chuc.html')) await initStaffLogic('org');
        else if (path.endsWith('doi-ngu-can-bo.html')) await initStaffLogic('all');
        else if (path.endsWith('chi-tiet.html')) await renderDetail(type, id);
        else if (path.endsWith('chuyen-muc.html')) await renderCategory(type || 'all');
        else if (isHomePath(path)) await initHomePage();

        // Hiệu ứng xuất hiện khi cuộn
        if (mainContent) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('show'); });
            }, { threshold: 0.1 });
            mainContent.querySelectorAll('section').forEach(sec => {
                sec.classList.add('animate-on-scroll');
                observer.observe(sec);
            });
        }
        window.SiteLayout?.setActive();
    }

    // Tải phần nội dung chính của một trang và thay vào trang hiện tại
    async function swapMainContent(targetUrl) {
        const response = await fetch(targetUrl.split('?')[0].split('#')[0]);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const newContent = doc.getElementById('main-content');
        if (!newContent) throw new Error('Trang không có #main-content');
        mainContent.innerHTML = newContent.innerHTML;
        if (doc.title) document.title = doc.title;
    }

    async function loadPage(targetUrl) {
        // Lưu vị trí cuộn để khi bấm "Quay lại" trở về đúng chỗ
        history.replaceState({ ...history.state, scrollY: window.scrollY }, '', location.href);
        mainContent.style.opacity = '0.3';
        try {
            await swapMainContent(targetUrl);
            history.pushState({ scrollY: 0 }, '', targetUrl);
            closeMobileMenu();
            await runPageLogic();
            const offset = mainContent.offsetTop - 80;
            window.scrollTo({ top: offset > 0 ? offset : 0, behavior: 'smooth' });
        } catch (e) {
            // Có lỗi thì tải lại cả trang theo cách bình thường
            location.href = targetUrl;
        } finally {
            mainContent.style.opacity = '1';
        }
    }

    initMobileMenu();

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link || !mainContent) return;

        const rawHref = link.getAttribute('href');
        if (!rawHref) return;
        if (rawHref === '#') { e.preventDefault(); return; }

        // Để trình duyệt tự xử lý: mở tab mới, Ctrl/Shift+click, link ngoài, tải file, link neo...
        if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        if (link.target === '_blank' || link.hasAttribute('download')) return;

        const url = new URL(link.href);
        if (url.origin !== location.origin) return;
        if (!url.pathname.startsWith(REPO_PATH) || url.pathname.startsWith(REPO_PATH + 'admin/')) return;
        if (!/(\.html|\/)$/.test(url.pathname)) return; // pdf, ảnh, ...
        if (url.hash && url.pathname === location.pathname && url.search === location.search) return;

        e.preventDefault();
        loadPage(url.href);
    });

    // Nút Quay lại / Tiến tới của trình duyệt
    window.addEventListener('popstate', async (event) => {
        try {
            await swapMainContent(location.href);
            await runPageLogic();
            window.scrollTo({ top: event.state?.scrollY || 0, behavior: 'instant' });
        } catch (e) {
            location.reload();
        }
    });

    runPageLogic();
});
