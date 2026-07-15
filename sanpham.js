// Biến phục vụ phân trang
const cardsPerPage = 12;
let currentPage = 1;
let pageGroup = 0;
const maxPageShow = 3;

// ================= 1. THEO DÕI ĐĂNG NHẬP (Lấy từ LocalStorage máy khách) =================
document.addEventListener("DOMContentLoaded", function () {
    const userBox = document.getElementById("userBox");
    if (!userBox) return;

    const isLogin = localStorage.getItem("isLogin");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (isLogin === "true" && currentUser) {
        const firstName = currentUser.fullName.trim().split(" ").pop();
        userBox.innerHTML = `
            <div class="user-info">
                <span>Xin chào, ${firstName}</span>
                <button id="logoutBtn">Đăng xuất</button>
            </div>
        `;
        document.getElementById("logoutBtn").addEventListener("click", function () {
            localStorage.removeItem("isLogin");
            localStorage.removeItem("currentUser");
            window.location.href = "dangnhap.html";
        });
    } else {
        userBox.innerHTML = `
            <a href="dangnhap.html">Đăng nhập</a>
        `;
    }
});

// ================= 2. TẢI DANH SÁCH XE TỪ FIREBASE REALTIME DATABASE =================
document.addEventListener("DOMContentLoaded", function () {
    const bangxe = document.querySelector(".bangxe");
    if (!bangxe) return;

    // Lắng nghe dữ liệu trực tuyến từ Firebase
    window.database.ref("products").on("value", (snapshot) => {
        // Xóa sạch xe cũ trước khi vẽ lại mới
        bangxe.innerHTML = ""; 

        const productsData = snapshot.val();

        if (!productsData) {
            bangxe.innerHTML = "<p style='text-align:center; width:100%;'>Chưa có xe nào được trưng bày.</p>";
            return;
        }

        // Tạo thẻ HTML cho từng chiếc xe lấy từ Firebase
        Object.keys(productsData).forEach((key) => {
            const sp = productsData[key];
            const card = document.createElement("div");

            card.className = "the";
            card.setAttribute("data-brand", sp.category || "all");
            card.dataset.show = "true"; // Mặc định hiển thị

            card.innerHTML = `
                <div class="anhxe">
                    <img src="${sp.image}" alt="${sp.name}">
                    <div class="giatien">
                        ${Number(sp.price).toLocaleString()} VNĐ
                    </div>
                </div>

                <div class="banduoi">
                    <h3>${sp.name}</h3>

                    <p class="thongso">
                        ${sp.acceleration || "--"}
                        <span>|</span>
                        ${sp.topspeed || "--"}
                    </p>

                    <button class="xemchitiet" onclick="xemChiTiet('${key}')">
                        <h4>XEM CHI TIẾT</h4>
                    </button>
                </div>
            `;

            bangxe.appendChild(card);
        });

        // Chỉ chạy Phân Trang sau khi toàn bộ thẻ xe đã vẽ xong
        currentPage = 1;
        pageGroup = 0;
        hienThiTrang(1);
        taoPagination();
    });
});

// Điều hướng sang trang xem chi tiết bằng Firebase Key
function xemChiTiet(firebaseKey) {
    localStorage.setItem("selectedProductId", firebaseKey);
    window.location.href = "xemchitietxe.html";
}

// ================= 3. PHÂN TRANG (PAGINATION) =================
function hienThiTrang(page) {
    const cards = document.querySelectorAll(".bangxe .the");
    const visibleCards = [...cards].filter(card => {
        return card.dataset.show === "true";
    });

    cards.forEach(card => {
        card.style.display = "none";
    });

    const start = (page - 1) * cardsPerPage;
    const end = start + cardsPerPage;

    for (let i = start; i < end && i < visibleCards.length; i++) {
        visibleCards[i].style.display = "block";
    }

    currentPage = page;
}

function taoPagination() {
    const cards = [...document.querySelectorAll(".bangxe .the")]
        .filter(card => card.dataset.show === "true");

    const totalPages = Math.ceil(cards.length / cardsPerPage);
    const chuyentrang = document.getElementById("chuyentrang");
    if (!chuyentrang) return;
    
    chuyentrang.innerHTML = "";

    if (totalPages <= 1) return;

    if (pageGroup > 0) {
        const prev = document.createElement("button");
        prev.innerHTML = "&lt;";
        prev.onclick = function () {
            pageGroup--;
            currentPage = pageGroup * maxPageShow + 1;
            hienThiTrang(currentPage);
            taoPagination();
        };
        chuyentrang.appendChild(prev);
    }

    const startPage = pageGroup * maxPageShow + 1;
    const endPage = Math.min(startPage + maxPageShow - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.innerHTML = i;

        if (i === currentPage) {
            btn.classList.add("active");
        }

        btn.onclick = function () {
            currentPage = i;
            hienThiTrang(currentPage);
            taoPagination();
        };
        chuyentrang.appendChild(btn);
    }

    if (endPage < totalPages) {
        const next = document.createElement("button");
        next.innerHTML = "&gt;";
        next.onclick = function () {
            pageGroup++;
            currentPage = pageGroup * maxPageShow + 1;
            hienThiTrang(currentPage);
            taoPagination();
        };
        chuyentrang.appendChild(next);
    }
}

// ================= 4. BỘ LỌC HÃNG XE (BRAND) =================
function locXe(brand) {
    let dsXe = document.querySelectorAll(".bangxe .the");

    dsXe.forEach(function (xe) {
        let hangXe = xe.getAttribute("data-brand");

        if (brand === "all" || hangXe === brand) {
            xe.dataset.show = "true";
        } else {
            xe.dataset.show = "false";
        }
    });

    currentPage = 1;
    pageGroup = 0;

    hienThiTrang(currentPage);
    taoPagination();
}

// ================= 5. TÌM KIẾM XE =================
function timKiemXe() {
    const keyword = document.getElementById("timkiemxe")
        .value
        .toLowerCase()
        .trim();

    const dsXe = document.querySelectorAll(".bangxe .the");

    dsXe.forEach(function (xe) {
        const tenXe = xe.querySelector("h3").textContent.toLowerCase();

        if (keyword === "" || tenXe.includes(keyword)) {
            xe.dataset.show = "true";
        } else {
            xe.dataset.show = "false";
        }
    });

    currentPage = 1;
    pageGroup = 0;

    hienThiTrang(currentPage);
    taoPagination();
}

// Lắng nghe sự kiện tìm kiếm
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("timkiemxe");
    const searchBtn = document.getElementById("nuttimkiemxe");

    if (searchInput) {
        searchInput.addEventListener("input", timKiemXe);
        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                timKiemXe();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", timKiemXe);
    }
});