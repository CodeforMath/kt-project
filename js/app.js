/**
 * HUSC - Faculty of Mathematics JS Framework
 */

// --- 1. CÁC HÀM TIỆN ÍCH NGOÀI ---
/**
 * Hàm điều khiển đóng/mở nội dung dùng chung
 * @param {string} contentId - ID của thẻ div chứa nội dung cần ẩn/hiện
 * @param {string} btnId - ID của thẻ button tương ứng
 */
function toggleContent(contentId, btnId) {
    var content = document.getElementById(contentId);
    var btn = document.getElementById(btnId);
    
    if (!content || !btn) return;

    // Kiểm tra trạng thái hiện tại
    if (content.style.display === "none" || content.style.display === "") {
        // Mở rộng nội dung
        content.style.display = "block";
        btn.innerHTML = 'Thu gọn <i class="fas fa-chevron-up"></i>';
    } else {
        // Thu gọn nội dung
        content.style.display = "none";
        btn.innerHTML = 'Xem thêm <i class="fas fa-chevron-right"></i>';
        
        // Cuộn trang về đúng vị trí section chứa nội dung đó
        btn.closest('section').scrollIntoView({ behavior: "smooth" });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('main-content');
    const homeContent = mainContent ? mainContent.innerHTML : '';

    // Hàm quan sát phần tử khi cuộn
    function initScrollObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    // Nếu muốn hiệu ứng chỉ chạy 1 lần, hãy bỏ comment dòng dưới:
                    // observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 }); // 0.1 nghĩa là hiện ra khi 10% phần tử đã vào màn hình

        // Áp dụng cho các section hoặc thẻ bạn muốn
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    }

    // Gọi hàm này sau khi render nội dung xong
    // Bạn hãy gọi nó ở cuối hàm runPageLogic()

    // --- 2. CẤU HÌNH ĐƯỜNG DẪN GỐC ---
    const getRepoPath = () => {
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            return path.split('/pages/')[0] + '/';
        }
        return path.substring(0, path.lastIndexOf('/') + 1);
    };

    const REPO_PATH = getRepoPath();
    const STAFF_JSON = REPO_PATH + 'data/staff.json?v=' + Date.now();
    const NEWS_JSON = REPO_PATH + 'data/data.json?v=' + Date.now();

    const formatDateForSort = (d) => d ? d.split('/').reverse().join('') : '0';

    const getCleanImgPath = (rawPath) => {
        if (!rawPath) return REPO_PATH + 'images/default.jpg';
        const clean = rawPath.replace(/^(\.\.\/|\.\/|\/)/, '');
        return REPO_PATH + clean;
    };

    const fixInternalHtmlPaths = (htmlString) => {
        if (!htmlString) return '';
        return htmlString.replace(/src=['"](\.\.\/|\.\/|\/|(?!\.\.\/))graph\//g, `src='${REPO_PATH}graph/`);
    };

    // --- 3. FETCH & RENDER DỮ LIỆU ---
    async function getMergedData() {
        try {
            const res = await fetch(NEWS_JSON);
            const data = await res.json();
            return Object.entries(data)
                .filter(([_, v]) => Array.isArray(v))
                .flatMap(([k, items]) => items.map(i => ({ ...i, categoryType: k })))
                .sort((a, b) => formatDateForSort(b.date).localeCompare(formatDateForSort(a.date)));
        } catch (e) { return []; }
    }

    function createStaffCard(p, displayTitle, isOrgPage = false) {
        const imgSrc = p.image ? getCleanImgPath(p.image) : REPO_PATH + 'images/default-avatar.jpg';
        const detailLink = REPO_PATH + `pages/thong-tin-gv.html?id=${p.id}`;
        
        if (isOrgPage === true) {
            return `
                <a href="${detailLink}" class="staff-card-simple">
                    <div class="staff-img-wrapper">
                        <img src="${imgSrc}" onerror="this.src='${REPO_PATH}images/default-avatar.jpg'">
                    </div>
                    <div class="role-text">${displayTitle}</div>
                    <div class="name-text">${p.name}</div>
                </a>`;
        }
        return `
            <a href="${detailLink}" class="staff-card-simple">
                <div class="staff-img-wrapper">
                    <img src="${imgSrc}" onerror="this.src='${REPO_PATH}images/default-avatar.jpg'">
                </div>
                <div class="name-text">${p.name}</div>
            </a>`;
    }

    async function initStaffLogic(pageType) {
        const container = document.getElementById(pageType === 'org' ? 'org-structure-container' : 'staff-all-container');
        if (!container) return;

        try {
            const res = await fetch(STAFF_JSON);
            const data = await res.json();
            const s = data.staff_data;
            let html = '';

            if (pageType === 'org') {
                const bcn = s.filter(i => i.roles?.includes('ban-chu-nhiem'));
                if (bcn.length) {
                    html += `<div class="org-block"><div class="org-label"><span>Ban Chủ nhiệm Khoa</span></div><div class="staff-flex-container">
                        ${bcn.map(p => createStaffCard(p, p.roles.includes('truong-khoa') ? 'Trưởng khoa' : 'Phó Trưởng khoa', true)).join('')}
                    </div></div>`;
                }

                const troLyMapping = { 'tl-sau-dai-hoc': 'TL Sau đại học', 'tl-to-chuc-nckh': 'TL Tổ chức và NCKH', 'tl-giao-vu': 'TL Giáo vụ', 'tl-ctsv-dbcl': 'TL CTSV và ĐBCL', 'van-thu': 'Văn thư' };
                const listTroLy = s.filter(i => i.roles?.some(r => r.startsWith('tl-') || r === 'van-thu'));
                if (listTroLy.length) {
                    html += `<div class="org-block"><div class="org-label"><span>Các trợ lý</span></div><div class="staff-flex-container">
                        ${listTroLy.map(p => {
                            const r = p.roles.find(r => r.startsWith('tl-')) || 'van-thu';
                            return createStaffCard(p, troLyMapping[r], true);
                        }).join('')}
                    </div></div>`;
                }

                const depts = [{id:'toan-ly-thuyet', label:'Bộ môn Toán Lý thuyết'}, {id:'toan-ung-dung', label:'Bộ môn Toán Ứng dụng'}, {id:'xac-suat-thong-ke', label:'Bộ môn Xác suất - Thống kê'}];
                depts.forEach(dept => {
                    const deptStaff = s.filter(i => i.department === dept.id);
                    if (deptStaff.length) {
                        const leader = deptStaff.find(i => i.roles?.includes('truong-bo-mon'));
                        const members = deptStaff.filter(i => !i.roles?.includes('truong-bo-mon'));
                        html += `<div class="org-block"><div class="org-label"><span>${dept.label}</span></div><div class="dept-container">
                            <div class="dept-leader-row">${leader ? createStaffCard(leader, 'Trưởng bộ môn', true) : ''}</div>
                            <div class="staff-flex-container" style="border:none;">
                                ${members.map(p => createStaffCard(p, 'Giảng viên', true)).join('')}
                            </div>
                        </div></div>`;
                    }
                });
            } else {
                const members = s.filter(i => i.type === 'giang-vien');
                html += `<div class="org-block"><div class="org-label"><span>Giảng viên</span></div><div class="staff-flex-container">
                    ${members.map(p => createStaffCard(p, null, false)).join('')}
                </div></div>`;
                
                const staff = s.filter(i => i.type === 'van-thu');
                if(staff.length) {
                    html += `<div class="org-block"><div class="org-label"><span>Văn thư</span></div><div class="staff-flex-container">
                        ${staff.map(p => createStaffCard(p, null, false)).join('')}
                    </div></div>`;
                }
            }
            container.innerHTML = html;
        } catch (e) { console.error(e); }
    }

    async function renderStaffDetail(id) {
        if (!id) return;
        try {
            const res = await fetch(STAFF_JSON);
            const data = await res.json();
            const p = data.staff_data.find(s => String(s.id) === String(id));
            if (!p) return;

            const setVal = (id, val, attr = 'innerText') => { 
                const el = document.getElementById(id); 
                if (el) el[attr] = val || '---'; 
            };

            setVal('gv-name-sidebar', p.name); 
            setVal('gv-fullname', p.name); 
            setVal('gv-gender', p.gender || 'Nam');
            setVal('gv-birthday', p.birthday); 
            setVal('gv-phone', p.contact?.phone);

            const emailEl = document.getElementById('gv-email');
            if (emailEl) { 
                emailEl.innerText = p.contact?.email || '---'; 
                emailEl.href = p.contact?.email ? `mailto:${p.contact.email}` : '#'; 
            }

            const imgEl = document.getElementById('gv-image');
            if (imgEl) imgEl.src = getCleanImgPath(p.image || 'images/default-avatar.jpg');

            const specialtyBox = document.querySelector('.specialty-content');
            const eduList = document.getElementById('gv-education-list');

            if (p.type === "giang-vien") {
                if (specialtyBox) {
                    specialtyBox.innerHTML = `
                        <h6 class="spec-title">1. Lĩnh vực nghiên cứu</h6>
                        <ul id="gv-research-list" class="dot-list-small">
                            ${p.research_fields?.map(f => `<li>${f}</li>`).join('') || '<li>Đang cập nhật...</li>'}
                        </ul>
                        <h6 class="spec-title">2. Kinh nghiệm giảng dạy</h6>
                        <ul id="gv-teaching-list" class="dot-list-small">
                            <li>Các học phần Toán cơ bản.</li>
                            <li>Các học phần chuyên ngành thuộc ${p.department_name || 'Toán học'}.</li>
                        </ul>
                        <h6 class="spec-title">3. Dữ liệu khoa học</h6>
                        <div class="science-link-wrapper">
                            <a id="gv-science-link" href="${p.science_url || '#'}" target="_blank" class="view-more-blue" style="${p.science_url ? '' : 'display:none'}">
                                <i class="fas fa-external-link-alt" style="margin-right: 8px;"></i> 
                                Xem chi tiết dữ liệu khoa học của giảng viên
                            </a>
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
                        </div>`).join('') || 'Đang cập nhật';
                }
            } else {
                if (specialtyBox) specialtyBox.innerHTML = `<p style="color: #666; font-style: italic; margin-top: 10px;">Dữ liệu đang được cập nhật...</p>`;
                if (eduList) eduList.innerHTML = `<p style="color: #666; font-style: italic;">Dữ liệu đang được cập nhật...</p>`;
            }
        } catch (e) { console.error("Lỗi render:", e); }
    }

    async function initHomePage() {
    const newsContainer = document.getElementById('latest-news-container'); 
    const noticeContainer = document.getElementById('latest-notices-container'); 
    
    if (!newsContainer || !noticeContainer) return;

    try {
        const allData = await getMergedData(); // Đã bao gồm tin tức + thông báo

        // 1. Bài tin tức mới nhất (Tiêu điểm)
        const topNews = allData.find(item => item.categoryType === 'tin-tuc'||
            item.categoryType === 'thong-bao'|| item.categoryType === 'hoc-bong' || item.categoryType === 'doan-hoi'
        );
        if (topNews) {
            newsContainer.innerHTML = `
                <div class="featured-news">
                    <a href="${REPO_PATH}pages/chi-tiet.html?type=${topNews.categoryType}&id=${topNews.id}" class="news-img-wrapper">
                        <img src="${getCleanImgPath(topNews.image)}" alt="${topNews.title}">
                    </a>
                    <div class="news-info">
                        <span class="news-date">${topNews.date}</span>
                        <a href="${REPO_PATH}pages/chi-tiet.html?type=${topNews.categoryType}&id=${topNews.id}" style="text-decoration:none; color:inherit;">
                            <h4 class="news-item-title">${topNews.title}</h4>
                        </a>
                        <p class="news-excerpt">${topNews.excerpt || ''}</p>
                    </div>
                </div>`;
        }

        // 2. Danh sách 10 bài mới nhất (Lấy từ mọi mục)
        noticeContainer.innerHTML = allData.slice(1, 11).map(i => `
            <li>
                <span class="t-dot"></span>
                <div class="t-content">
                    <span class="news-date">${i.date} <b style="color:#004488">[${i.categoryType === 'tin-tuc' ? 'Tin tức' : 'Thông báo'}]</b></span>
                    <a href="${REPO_PATH}pages/chi-tiet.html?type=${i.categoryType}&id=${i.id}">
                        ${i.title}
                    </a>
                </div>
            </li>`).join('');

    } catch (e) {
        console.error("Lỗi trang chủ:", e);
    }
}

    async function renderCategory(type) {
    const listEl = document.getElementById('category-list');
    if (!listEl) return;

    const titleEl = document.querySelector('.section-title h2') || document.getElementById('category-title');
    
    // Cập nhật tiêu đề trang dựa trên tham số
    const titles = {
        'tin-tuc': 'TIN TỨC',
        'thong-bao': 'THÔNG BÁO',
        'hoc-bong': 'HỌC BỔNG',
        'doan-hoi': 'ĐOÀN - HỘI',
        'all': 'TẤT CẢ TIN TỨC & SỰ KIỆN'
    };
    if (titleEl) titleEl.innerText = titles[type] || 'DANH MỤC';

    // Lấy toàn bộ dữ liệu đã gộp (Hàm getMergedData của bạn đã fetch và sort rồi)
    const allItems = await getMergedData();
    
    // Lọc dữ liệu: Nếu là 'all' thì lấy hết, nếu không thì lọc theo đúng thư mục
    const itemsToShow = type === 'all' 
        ? allItems 
        : allItems.filter(i => i.categoryType === type);

    // Hàm hỗ trợ lấy tên tiếng Việt của thư mục để hiển thị nhãn (Tag)
    const getVNCategory = (cat) => {
        const map = {'tin-tuc':'Tin tức', 'thong-bao':'Thông báo', 'hoc-bong':'Học bổng', 'doan-hoi':'Đoàn - Hội'};
        return map[cat] || 'Tin tức';
    };

    listEl.innerHTML = itemsToShow.map(i => `
        <div class="news-item-card">
            <div class="news-img-box">
                <img src="${getCleanImgPath(i.image)}" class="news-thumb" onerror="this.src='${REPO_PATH}images/default.jpg'">
            </div>
            <div class="news-body">
                <div class="news-meta">
                    <span class="news-date">${i.date}</span>
                    <span class="news-category-tag" style="color: #004488; font-weight: bold; margin-left: 8px;">
                        [${getVNCategory(i.categoryType)}]
                    </span>
                </div>
                <a href="${REPO_PATH}pages/chi-tiet.html?type=${i.categoryType}&id=${i.id}" class="news-item-title">
                    ${i.title}
                </a>
                <p class="news-excerpt">${i.excerpt || ''}</p>
            </div>
        </div>`).join('');
}

    async function renderDetail(type, id) {
        const contentEl = document.getElementById('post-content');
        if (!contentEl) return;
        try {
            const res = await fetch(NEWS_JSON);
            const data = await res.json();
            const post = data[type]?.find(p => String(p.id) === String(id));
            if (post) {
                document.getElementById('post-title').innerText = post.title;
                contentEl.innerHTML = fixInternalHtmlPaths(post.content || post.excerpt);
            }
        } catch (e) { console.error(e); }
    }

    // --- 4. HỆ THỐNG MENU MOBILE ---
    function initMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.husc-nav');
        if (!menuBtn || !nav) return;

        const updateIcon = (isOpen) => {
            const icon = menuBtn.querySelector('i');
            if (icon) icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
        };

        menuBtn.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            const isNowActive = nav.classList.toggle('active');
            updateIcon(isNowActive);
        };

        nav.querySelectorAll('li').forEach(item => {
            const link = item.querySelector(':scope > a');
            const subMenu = item.querySelector(':scope > .sub-menu, :scope > .sub-menu-lvl3');
            if (link) {
                link.onclick = (e) => {
                    if (window.innerWidth <= 1024) {
                        if (subMenu) {
                            e.preventDefault(); e.stopPropagation();
                            const parentUl = item.parentElement;
                            parentUl.querySelectorAll(':scope > li.active-parent').forEach(activeItem => {
                                if (activeItem !== item) {
                                    activeItem.classList.remove('active-parent');
                                    const activeSub = activeItem.querySelector(':scope > .sub-menu, :scope > .sub-menu-lvl3');
                                    if (activeSub) activeSub.classList.remove('open');
                                }
                            });
                            const isOpening = subMenu.classList.toggle('open');
                            item.classList.toggle('active-parent', isOpening);
                        } else {
                            nav.classList.remove('active');
                            updateIcon(false);
                        }
                    }
                };
            }
        });

        document.onclick = (e) => {
            if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                nav.classList.remove('active');
                updateIcon(false);
                nav.querySelectorAll('.open').forEach(s => s.classList.remove('open'));
                nav.querySelectorAll('.active-parent').forEach(p => p.classList.remove('active-parent'));
            }
        };
    }

    // --- 5. ĐIỀU HƯỚNG SPA ---
    async function runPageLogic(isPopState = false) {
        const url = new URL(window.location.href);
        const path = url.pathname;
        const id = url.searchParams.get('id');
        const type = url.searchParams.get('type');
        const isHomePage = path.endsWith('index.html') || path === REPO_PATH || path === REPO_PATH + 'index.html';

        // --- BƯỚC MỚI: XỬ LÝ NẠP NỘI DUNG KHI BACK TRANG TRUNG GIAN ---
        if (isPopState && !isHomePage) {
            try {
                // Tải lại file .html tương ứng với URL hiện tại
                const response = await fetch(path);
                const html = await response.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const newContent = doc.getElementById('main-content') || doc.querySelector('main');
                if (newContent && mainContent) {
                    mainContent.innerHTML = newContent.innerHTML;
                }
            } catch (e) {
                console.error("Lỗi nạp trang trung gian khi Back:", e);
            }
        }

        // --- LOGIC RENDER DỮ LIỆU (Giữ nguyên) ---
        if (path.includes('thong-tin-gv.html')) {
            await renderStaffDetail(id);
        } else if (path.includes('co-cau-to-chuc.html')) {
            await initStaffLogic('org');
        } else if (path.includes('doi-ngu-can-bo.html')) {
            await initStaffLogic('all');
        } else if (id && type) {
            await renderDetail(type, id);
        } else if (type) {
            await renderCategory(type);
        } else if (isHomePage) {
            if (mainContent && homeContent) mainContent.innerHTML = homeContent;
            await initHomePage();
        }

        // --- THÊM ĐOẠN NÀY ĐỂ KÍCH HOẠT HIỆU ỨNG CUỘN ---
        // 1. Thêm class cho tất cả các section vừa được render
        const sections = mainContent.querySelectorAll('section');
        sections.forEach(sec => {
            sec.classList.add('animate-on-scroll'); // Class này định nghĩa ở CSS
        });

        // 2. Khởi tạo lại Observer cho các section mới
        initScrollObserver();
        // --- XỬ LÝ CUỘN TRANG (Đảm bảo về đúng vị trí) ---
        setTimeout(() => {
            if (isPopState && history.state && history.state.scrollY !== undefined) {
                window.scrollTo({ top: history.state.scrollY, behavior: 'instant' });
            } else {
                const offset = mainContent ? mainContent.offsetTop - 80 : 0;
                window.scrollTo({ top: offset > 0 ? offset : 0, behavior: 'smooth' });
            }
        }, 150); // Tăng độ trễ lên một chút để nội dung kịp đổ ra
    }

    async function loadPage(href) {
    if (!mainContent) return;
    
    // Lưu vị trí cuộn trang hiện tại trước khi đi trang mới
    history.replaceState({ ...history.state, scrollY: window.scrollY }, '', window.location.href);

    const targetUrl = new URL(href, window.location.origin + REPO_PATH).href;
    mainContent.style.opacity = '0.3';
    
    try {
        const response = await fetch(targetUrl.split('?')[0]);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newContent = doc.getElementById('main-content') || doc.querySelector('main');
        
        if (newContent) {
            // Lưu URL vào state để phục vụ việc Back/Forward
            history.pushState({ path: targetUrl, scrollY: 0 }, '', targetUrl);
            mainContent.innerHTML = newContent.innerHTML;
            await runPageLogic(false); 
        } else {
            window.location.href = targetUrl;
        }
    } catch (e) {
        window.location.href = targetUrl;
    } finally {
        setTimeout(() => { mainContent.style.opacity = '1'; }, 50);
    }
}
    
    // --- 6. KHỞI TẠO EVENT LISTENERS ---
    initMobileMenu();

    document.addEventListener('click', (e) => {
    // 1. Xác định thẻ <a> gần nhất với điểm click
    const link = e.target.closest('a');
    
    // 2. Các trường hợp ngoại lệ không xử lý bằng SPA
    if (!link || 
        link.target === '_blank' || 
        link.href.includes('#') || 
        link.href.startsWith('mailto:') || 
        link.href.startsWith('tel:')) return;

    // 3. Xử lý menu trên Mobile: Nếu có menu con thì không chuyển trang ngay mà để toggle
    const parentLi = link.closest('li');
    if (window.innerWidth <= 1024 && parentLi?.querySelector('ul')) return; 

    // 4. Lấy đường dẫn href
    const href = link.getAttribute('href');
    if (!href) return;

    // 5. Kiểm tra nếu là link nội bộ (không bắt đầu bằng http/https)
    if (!href.startsWith('http') && !href.startsWith('//')) {
        e.preventDefault();

        // --- BƯỚC QUAN TRỌNG: LƯU VỊ TRÍ CUỘN HIỆN TẠI ---
        // Trước khi chuyển sang trang mới, ghi đè vị trí cuộn của trang hiện tại vào history
        history.replaceState(
            { ...history.state, scrollY: window.scrollY }, 
            document.title, 
            window.location.href
        );

        // 6. Xử lý logic chuyển trang
        if (href === 'index.html' || href === '/' || href.endsWith('/index.html')) {
            // Trang chủ
            const homeFullUrl = REPO_PATH + 'index.html';
            
            // Đẩy trạng thái trang chủ vào lịch sử, vị trí cuộn mặc định là 0
            history.pushState({ path: homeFullUrl, scrollY: 0 }, '', homeFullUrl);
            
            // Chạy logic render trang chủ và cuộn lên đầu (false = không phải popstate)
            runPageLogic(false); 
        } else {
            // Các trang con khác
            loadPage(href);
        }
    }
});

    // SỬA ĐỔI: Khi Back, truyền true vào runPageLogic để không cuộn trang
    window.addEventListener('popstate', (event) => {
        runPageLogic(true); 
    });

    runPageLogic(); 
});