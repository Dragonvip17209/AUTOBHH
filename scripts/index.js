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
document.addEventListener("DOMContentLoaded", function () {
  const userBox = document.getElementById("userBox");
  const isLogin = localStorage.getItem("isLogin");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (isLogin === "true" && currentUser) {
    const firstName = currentUser.fullName.trim().split(" ").pop();
    userBox.innerHTML = `
      <div class="user-info">
        <span>${firstName}</span>
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
const cardsPerPage = 12;
let currentPage = 1;
let pageGroup = 0;
const maxPageShow = 3;

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
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".bangxe .the").forEach(card => {
        card.dataset.show = "true";
    });

    hienThiTrang(1);
    taoPagination();

});
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
document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("timkiemxe");
    const searchBtn = document.getElementById("nuttimkiemxe");

    searchInput.addEventListener("input", timKiemXe);

    searchBtn.addEventListener("click", timKiemXe);

    searchInput.addEventListener("keydown", function(e){
        if(e.key === "Enter"){
            timKiemXe();
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {

    let products = JSON.parse(localStorage.getItem("products")) || [];

    const bangxe = document.querySelector(".bangxe");

    products.forEach(sp => {

        const card = document.createElement("div");

        card.className = "the";
        card.setAttribute("data-brand", sp.category);

        card.innerHTML = `
    <div class="anhxe">
        <img src="${sp.image}" alt="">
        <div class="giatien">
            ${Number(sp.price).toLocaleString()} VNĐ
        </div>
    </div>

    <div class="banduoi">
        <h3>${sp.name}</h3>

        <p class="thongso">
            ${sp.engine || "Chưa cập nhật"}
        </p>

        <button class="xemchitiet"
                onclick="xemChiTiet(${sp.id})">
            <h4>XEM CHI TIẾT</h4>
        </button>
    </div>
`;

        // thêm vào cuối danh sách xe
        bangxe.appendChild(card);
    });

    // cập nhật phân trang sau khi thêm
    document.querySelectorAll(".bangxe .the").forEach(card => {
        card.dataset.show = "true";
    });

    hienThiTrang(1);
    taoPagination();
});
function xemChiTiet(id){

    localStorage.setItem(
        "selectedProductId",
        id
    );

    window.location.href =
        "xemchitietxe.html";
}