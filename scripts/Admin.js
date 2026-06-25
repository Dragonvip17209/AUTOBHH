let editingIndex = -1;
// ================= LOGIN CHECK =================
document.addEventListener("DOMContentLoaded", function () {

    const role = localStorage.getItem("role");

    if (role !== "admin") {
        alert("Không có quyền!");
        window.location.href = "index.html";
        return;
    }

    showTab("sanpham");
    loadUsers();
    loadOrders();
});

// ================= TAB =================
function showTab(name) {

    document.querySelectorAll(".noidung")
        .forEach(t => t.classList.remove("active"));

    const tab = document.getElementById("tab-" + name);

    if (tab) tab.classList.add("active");

    if(name === "xe"){
        loadCars();
    }

    const title = document.getElementById("page-title");

    if (title) {
        if (name === "sanpham") title.innerText = "Quản Lý Sản Phẩm";
        if (name === "nguoidung") title.innerText = "Quản Lý Khách Hàng";
        if (name === "donhang") title.innerText = "Quản Lý Đơn Hàng";
        if (name === "xe") title.innerText = "Quản Lý Xe";
    }
}
// ================= ORDER =================
function openOrderForm() {
    const box = document.getElementById("order-form-box");
    if (!box) return;

    box.style.display = "block";

    document.getElementById("order-id").value =
        "DH-" + Date.now().toString(36).toUpperCase();
}

// ================= SAVE ORDER =================
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("order-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let orders = JSON.parse(localStorage.getItem("orders")) || [];

        const order = {
            orderId: document.getElementById("order-id").value,
            customer: document.getElementById("customer-name").value,
            phone: document.getElementById("customer-phone").value,
            address: document.getElementById("customer-address").value,
            product: document.getElementById("product-name").value,
            total: document.getElementById("total-price").value,
            status: "Chờ xác nhận"
        };

        orders.push(order);
        localStorage.setItem("orders", JSON.stringify(orders));

        form.reset();
        document.getElementById("order-form-box").style.display = "none";

        loadOrders();
        alert("Đã lưu đơn!");
    });
});

// ================= LOAD ORDERS =================
function loadOrders() {

    const tbody = document.getElementById("order-table-body");
    if (!tbody) return;

    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    tbody.innerHTML = "";

    orders.forEach((o, i) => {
        tbody.innerHTML += `
        <tr>
            <td>${o.orderId}</td>
            <td>${o.customer}</td>
            <td>${o.phone}</td>
            <td>${o.address}</td>
            <td>${o.product}</td>
            <td>${Number(o.total).toLocaleString()}</td>
            <td>${o.status}</td>
            <td>
                <button class="btn-accept" onclick="acceptOrder(${i})">Xác Nhận</button>
                <button class="btn-delete" onclick="deleteOrder(${i})">Xoá</button>
            </td>
        </tr>`;
    });
}
function loadUsers() {

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const tbody = document.getElementById("user-table-body");

    if (!tbody) return;

    tbody.innerHTML = "";

    users.forEach((u, i) => {
        tbody.innerHTML += `
        <tr>
            <td>${i + 1}</td>
            <td>${u.fullName}</td>
            <td>${u.email}</td>
            <td>${u.phone}</td>
            <td>${u.password}</td>
            <td>
                <button class="btn-delete" onclick="deleteUser(${i})">Xóa</button>
            </td>
        </tr>
        `;
    });
}
function deleteUser(i) {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (!confirm("Xóa user này?")) return;

    users.splice(i, 1);

    localStorage.setItem("users", JSON.stringify(users));

    loadUsers();
}
function saveProduct(e){

    e.preventDefault();

    let products =
        JSON.parse(localStorage.getItem("products")) || [];

    const file =
        document.getElementById("p-img").files[0];

    // ===== SỬA XE KHÔNG ĐỔI ẢNH =====
    if(editingIndex !== -1 && !file){

        products[editingIndex] = {

            ...products[editingIndex],

            name: document.getElementById("p-name").value,
            price: document.getElementById("p-price").value,
            category: document.getElementById("p-category").value,
            year: document.getElementById("p-year").value,
            engine: document.getElementById("p-engine").value,
            power: document.getElementById("p-power").value,
            gearbox: document.getElementById("p-gearbox").value,
            drive: document.getElementById("p-drive").value,
            acceleration: document.getElementById("p-acceleration").value,
            topspeed: document.getElementById("p-topspeed").value,
            description: document.getElementById("p-description").value

        };

        localStorage.setItem(
            "products",
            JSON.stringify(products)
        );

        alert("Đã cập nhật xe");

        editingIndex = -1;

        document.getElementById("product-form").reset();

        document.getElementById("form-title").innerText =
            "Thêm Sản Phẩm Mới";

        document.getElementById("btn-submit-form").innerText =
            "Thêm Sản Phẩm";

        showTab("xe");
        loadCars();

        return;
    }

    // ===== THÊM MỚI PHẢI CÓ ẢNH =====
    if(editingIndex === -1 && !file){

        alert("Vui lòng chọn ảnh");

        return;
    }

    const reader = new FileReader();

    reader.onload = function(event){

        const product = {

            id: editingIndex === -1
                ? Date.now()
                : products[editingIndex].id,

            name: document.getElementById("p-name").value,
            price: document.getElementById("p-price").value,
            category: document.getElementById("p-category").value,

            image: event.target.result,

            year: document.getElementById("p-year").value,
            engine: document.getElementById("p-engine").value,
            power: document.getElementById("p-power").value,
            gearbox: document.getElementById("p-gearbox").value,
            drive: document.getElementById("p-drive").value,
            acceleration: document.getElementById("p-acceleration").value,
            topspeed: document.getElementById("p-topspeed").value,
            description: document.getElementById("p-description").value
        };

        if(editingIndex === -1){

            products.push(product);

        }else{

            products[editingIndex] = product;
        }

        localStorage.setItem(
            "products",
            JSON.stringify(products)
        );

        alert("Lưu thành công");

        editingIndex = -1;

        document.getElementById("product-form").reset();

        document.getElementById("form-title").innerText =
            "Thêm Sản Phẩm Mới";

        document.getElementById("btn-submit-form").innerText =
            "Thêm Sản Phẩm";

        showTab("xe");
        loadCars();
    };

    reader.readAsDataURL(file);
}
// ================= ACCEPT =================
function acceptOrder(i) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders[i].status = "Đã xác nhận";
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
}

// ================= DELETE =================
function deleteOrder(i) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.splice(i, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
}
function loadCars() {

    const container = document.getElementById("admin-car-list");

    if (!container) return;

    const products =
        JSON.parse(localStorage.getItem("products")) || [];

    container.innerHTML = "";

    if(products.length === 0){
        container.innerHTML = "<p>Chưa có xe nào</p>";
        return;
    }

    products.forEach((car, index) => {

        container.innerHTML += `
        <div class="the">

            <div class="anhxe">
                <img src="${car.image}" alt="${car.name}">
                <div class="giatien">
                    ${Number(car.price).toLocaleString()} VNĐ
                </div>
            </div>

            <div class="banduoi">
                <h3>${car.name}</h3>

                <p>${car.engine || ""}</p>

                <div class="admin-action">
                    <button onclick="editCar(${index})">
                        Sửa
                    </button>

                    <button onclick="deleteCar(${index})">
                        Xóa
                    </button>
                </div>
            </div>

        </div>
        `;
    });
}
function deleteCar(index){

    if(!confirm("Bạn có chắc muốn xóa xe này?")){
        return;
    }

    let products =
        JSON.parse(localStorage.getItem("products")) || [];

    products.splice(index,1);

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    loadCars();
}
function editCar(index){

    let products =
        JSON.parse(localStorage.getItem("products")) || [];

    let car = products[index];

    editingIndex = index;

    showTab("sanpham");

    document.getElementById("p-name").value = car.name;
    document.getElementById("p-price").value = car.price;
    document.getElementById("p-category").value = car.category;
    document.getElementById("p-year").value = car.year;
    document.getElementById("p-engine").value = car.engine;
    document.getElementById("p-power").value = car.power;
    document.getElementById("p-gearbox").value = car.gearbox;
    document.getElementById("p-drive").value = car.drive;
    document.getElementById("p-acceleration").value = car.acceleration;
    document.getElementById("p-topspeed").value = car.topspeed;
    document.getElementById("p-description").value = car.description;

    document.getElementById("form-title").innerText =
        "Sửa Thông Tin Xe";

    document.getElementById("btn-submit-form").innerText =
        "Cập Nhật Xe";
	document.getElementById("p-img").required = false;
}
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