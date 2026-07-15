let editingFirebaseKey = null;
let currentProductId = null;
let isSaving = false; // Bi?n c? (flag) ch?n d?ng vi?c submit dúp 

// Các bi?n c?u hình phân trang cho danh sách Xe c?a Admin
let currentPage = 1;
const cardsPerPage = 12;
let pageGroup = 0;
const maxPageShow = 3;

// ================= KH?I T?O TRANG ADMIN =================
document.addEventListener("DOMContentLoaded", function () {
    showTab("sanpham");
    loadUsers();
    loadOrders();
    loadCars();  

    // Gán s? ki?n submit cho form thêm/s?a s?n ph?m
    const productForm = document.getElementById("product-form");
    if (productForm) {
        productForm.removeEventListener("submit", saveProduct);
        productForm.addEventListener("submit", saveProduct);
    }

    // Gán s? ki?n submit cho form d?t don hàng
    const orderForm = document.getElementById("order-form");
    if (orderForm) {
        orderForm.addEventListener("submit", saveOrderSubmit);
    }

    // Gán s? ki?n tìm ki?m xe trong tab Qu?n Lý Xe
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

// ================= 1. CHUY?N Ð?I TAB QU?N LÝ =================
function showTab(name) {
    document.querySelectorAll(".noidung").forEach(t => t.classList.remove("active"));

    const tab = document.getElementById("tab-" + name);
    if (tab) tab.classList.add("active");
    
    const title = document.getElementById("page-title");
    if (title) {
        if (name === "sanpham") title.innerText = "Qu?n Lý S?n Ph?m";
        if (name === "nguoidung") title.innerText = "Qu?n Lý Khách Hàng";
        if (name === "donhang") title.innerText = "Qu?n Lý Ðon Hàng";
        if (name === "xe") title.innerText = "Qu?n Lý Xe";
    }
}

// ================= 2. QU?N LÝ ÐON HÀNG =================
function openOrderForm() {
    const box = document.getElementById("order-form-box");
    if (!box) return;

    box.style.display = "block";
    document.getElementById("order-id").value = "DH-" + Date.now().toString(36).toUpperCase();
}

function saveOrderSubmit(e) {
    e.preventDefault();

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    const order = {
        orderId: document.getElementById("order-id").value,
        customer: document.getElementById("customer-name").value,
        phone: document.getElementById("customer-phone").value,
        address: document.getElementById("customer-address").value,
        product: document.getElementById("product-name").value,
        total: document.getElementById("total-price").value,
        status: "Ch? xác nh?n"
    };

    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    const form = document.getElementById("order-form");
    if (form) form.reset();
    
    document.getElementById("order-form-box").style.display = "none";

    loadOrders();
    alert("Ðã luu don thành công!");
}

function acceptOrder(index) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    if (!orders[index]) return;

    orders[index].status = "Ðã xác nh?n";
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
    alert("Ðã xác nh?n don hàng thành công!");
}

function deleteOrder(index) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    if (!confirm("B?n có ch?c ch?n mu?n xóa don hàng này?")) return;

    orders.splice(index, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
    alert("Ðã xóa don hàng thành công!");
}

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
            <td>${Number(o.total).toLocaleString()} VNÐ</td>
            <td>${o.status}</td>
            <td>
                <button class="btn-accept" onclick="acceptOrder(${i})">Xác Nh?n</button>
                <button class="btn-delete" onclick="deleteOrder(${i})">Xoá</button>
            </td>
        </tr>`;
    });
}

// ================= 3. QU?N LÝ NGU?I DÙNG =================
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
        </tr>`;
    });
}

function deleteUser(i) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (!confirm("B?n có ch?c ch?n mu?n xóa user này?")) return;

    users.splice(i, 1);
    localStorage.setItem("users", JSON.stringify(users));
    loadUsers();
}

// ================= 4. QU?N LÝ S?N PH?M / XE (Firebase Realtime) =================
function saveProduct(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (isSaving) return;
    isSaving = true; 

    const file = document.getElementById("p-img").files[0];

    const carData = {
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

    if (editingFirebaseKey !== null && !file) {
        window.database.ref("products/" + editingFirebaseKey).update(carData)
        .then(() => {
            alert("Ðã c?p nh?t xe thành công!");
            isSaving = false;
            resetProductForm();
        }).catch(() => { isSaving = false; });
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        carData.image = event.target.result;

        if (editingFirebaseKey === null) {
            const newCarRef = window.database.ref("products").push();
            newCarRef.set(carData).then(() => {
                alert("Thêm xe m?i thành công!");
                isSaving = false;
                resetProductForm();
            }).catch(() => { isSaving = false; });
        } else {
            window.database.ref("products/" + editingFirebaseKey).set(carData).then(() => {
                alert("C?p nh?t thông tin và ?nh thành công!");
                isSaving = false;
                resetProductForm();
            }).catch(() => { isSaving = false; });
        }
    };
    reader.readAsDataURL(file);
}

function resetProductForm() {
    editingFirebaseKey = null;
    const form = document.getElementById("product-form");
    if (form) form.reset();
    
    document.getElementById("form-title").innerText = "Thêm S?n Ph?m M?i";
    document.getElementById("btn-submit-form").innerText = "Thêm S?n Ph?m";
    document.getElementById("p-img").required = true;
    showTab("xe");
}

// ---------------- LOAD XE & TÍCH H?P DATASET Ð? PHÂN TRANG ----------------
function loadCars() {
    const container = document.getElementById("admin-car-list");
    if (!container) return;

    const productsRef = window.database.ref("products");
    productsRef.off();

    productsRef.on("value", (snapshot) => {
        container.innerHTML = "";
        const productsData = snapshot.val();
        
        if (!productsData) {
            container.innerHTML = "<p style='text-align:center;'>Chua có xe nào trong h? th?ng.</p>";
            const chuyentrang = document.getElementById("chuyentrang");
            if (chuyentrang) chuyentrang.innerHTML = "";
            return;
        }

        // Render toàn b? xe ra HTML, m?c d?nh d?t dataset.show = "true"
        Object.keys(productsData).forEach((key) => {
            const car = productsData[key];
            
            container.innerHTML += `
            <div class="the" data-show="true">
                <div class="anhxe">
                    <img src="${car.image}" alt="${car.name}">
                    <div class="giatien">
                        ${Number(car.price).toLocaleString()} VNÐ
                    </div>
                </div>
                <div class="banduoi">
                    <h3>${car.name}</h3>
                    <p>
                        <strong>0-100:</strong> ${car.acceleration || "--"}&nbsp; | &nbsp;
                        <strong>T?i da:</strong> ${car.topspeed || "--"}
                    </p>
                    <div class="admin-action">
                        <button onclick="editCar('${key}')">S?a</button>
                        <button onclick="deleteCar('${key}')">Xóa</button>
                    </div>
                </div>
            </div>`;
        });

        // M?i l?n Firebase t?i/c?p nh?t d? li?u, ch?y l?i b? l?c tìm ki?m & phân trang
        timKiemXe();
    });
}

function deleteCar(key) {
    if (!confirm("B?n có ch?c mu?n xóa xe này kh?i h? th?ng?")) return;

    window.database.ref("products/" + key).remove()
    .then(() => {
        alert("Ðã xóa xe kh?i h? th?ng!");
    });
}

function editCar(key) {
    window.database.ref("products/" + key).once("value").then((snapshot) => {
        const car = snapshot.val();
        if (!car) return;

        editingFirebaseKey = key;
        showTab("sanpham");

        document.getElementById("p-name").value = car.name;
        document.getElementById("p-price").value = car.price;
        document.getElementById("p-category").value = car.category;
        document.getElementById("p-year").value = car.year || "";
        document.getElementById("p-engine").value = car.engine || "";
        document.getElementById("p-power").value = car.power || "";
        document.getElementById("p-gearbox").value = car.gearbox || "";
        document.getElementById("p-drive").value = car.drive || "";
        document.getElementById("p-acceleration").value = car.acceleration || "";
        document.getElementById("p-topspeed").value = car.topspeed || "";
        document.getElementById("p-description").value = car.description || "";

        document.getElementById("form-title").innerText = "S?a Thông Tin Xe";
        document.getElementById("btn-submit-form").innerText = "C?p Nh?t Xe";
        document.getElementById("p-img").required = false;
    });
}

// ---------------- 5. LOGIC TÌM KI?M XE ----------------
function timKiemXe() {
    const searchInput = document.getElementById("timkiemxe");
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const dsXe = document.querySelectorAll("#admin-car-list .the");

    dsXe.forEach(function (xe) {
        const tenXe = xe.querySelector("h3").textContent.toLowerCase();

        if (keyword === "" || tenXe.includes(keyword)) {
            xe.dataset.show = "true";
        } else {
            xe.dataset.show = "false";
        }
    });

    // Reset v? trang 1 m?i khi t? khóa tìm ki?m thay d?i
    currentPage = 1;
    pageGroup = 0;

    hienThiTrang(currentPage);
    taoPagination();
}

// ---------------- 6. LOGIC HI?N TH? TRANG ----------------
function hienThiTrang(page) {
    const cards = [...document.querySelectorAll("#admin-car-list .the")]
        .filter(card => card.dataset.show === "true");

    const totalCards = cards.length;
    
    // ?n toàn b? th? xe tru?c
    document.querySelectorAll("#admin-car-list .the").forEach(card => card.style.display = "none");

    // Ch? hi?n th? các th? xe thu?c trang hi?n t?i
    const startIndex = (page - 1) * cardsPerPage;
    const endIndex = Math.min(startIndex + cardsPerPage, totalCards);

    for (let i = startIndex; i < endIndex; i++) {
        if (cards[i]) {
            cards[i].style.display = "block"; // Ho?c "flex" tùy thu?c CSS layout c?a b?n
        }
    }
}

// ---------------- 7. LOGIC T?O THANH PHÂN TRANG (PAGINATION) ----------------
function taoPagination() {
    const cards = [...document.querySelectorAll("#admin-car-list .the")]
        .filter(card => card.dataset.show === "true");

    const totalPages = Math.ceil(cards.length / cardsPerPage);
    const chuyentrang = document.getElementById("chuyentrang");
    if (!chuyentrang) return;
    
    chuyentrang.innerHTML = "";

    // N?u không có s?n ph?m nào ho?c ch? có 1 trang thì không hi?n thanh phân trang
    if (totalPages <= 1) return;

    // Nút BACK (<) di chuy?n group trang
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

    // T?o các nút s? trang
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

    // Nút NEXT (>) di chuy?n group trang
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
}let editingFirebaseKey = null;
let currentProductId = null;
let isSaving = false; // Bi?n c? (flag) ch?n d?ng vi?c submit dúp 

// Các bi?n c?u hình phân trang cho danh sách Xe c?a Admin
let currentPage = 1;
const cardsPerPage = 12;
let pageGroup = 0;
const maxPageShow = 3;

// ================= KH?I T?O TRANG ADMIN =================
document.addEventListener("DOMContentLoaded", function () {
    showTab("sanpham");
    loadUsers();
    loadOrders();
    loadCars();  

    // Gán s? ki?n submit cho form thêm/s?a s?n ph?m
    const productForm = document.getElementById("product-form");
    if (productForm) {
        productForm.removeEventListener("submit", saveProduct);
        productForm.addEventListener("submit", saveProduct);
    }

    // Gán s? ki?n submit cho form d?t don hàng
    const orderForm = document.getElementById("order-form");
    if (orderForm) {
        orderForm.addEventListener("submit", saveOrderSubmit);
    }

    // Gán s? ki?n tìm ki?m xe trong tab Qu?n Lý Xe
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

// ================= 1. CHUY?N Ð?I TAB QU?N LÝ =================
function showTab(name) {
    document.querySelectorAll(".noidung").forEach(t => t.classList.remove("active"));

    const tab = document.getElementById("tab-" + name);
    if (tab) tab.classList.add("active");
    
    const title = document.getElementById("page-title");
    if (title) {
        if (name === "sanpham") title.innerText = "Qu?n Lý S?n Ph?m";
        if (name === "nguoidung") title.innerText = "Qu?n Lý Khách Hàng";
        if (name === "donhang") title.innerText = "Qu?n Lý Ðon Hàng";
        if (name === "xe") title.innerText = "Qu?n Lý Xe";
    }
}

// ================= 2. QU?N LÝ ÐON HÀNG =================
function openOrderForm() {
    const box = document.getElementById("order-form-box");
    if (!box) return;

    box.style.display = "block";
    document.getElementById("order-id").value = "DH-" + Date.now().toString(36).toUpperCase();
}

function saveOrderSubmit(e) {
    e.preventDefault();

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    const order = {
        orderId: document.getElementById("order-id").value,
        customer: document.getElementById("customer-name").value,
        phone: document.getElementById("customer-phone").value,
        address: document.getElementById("customer-address").value,
        product: document.getElementById("product-name").value,
        total: document.getElementById("total-price").value,
        status: "Ch? xác nh?n"
    };

    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    const form = document.getElementById("order-form");
    if (form) form.reset();
    
    document.getElementById("order-form-box").style.display = "none";

    loadOrders();
    alert("Ðã luu don thành công!");
}

function acceptOrder(index) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    if (!orders[index]) return;

    orders[index].status = "Ðã xác nh?n";
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
    alert("Ðã xác nh?n don hàng thành công!");
}

function deleteOrder(index) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    if (!confirm("B?n có ch?c ch?n mu?n xóa don hàng này?")) return;

    orders.splice(index, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
    alert("Ðã xóa don hàng thành công!");
}

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
            <td>${Number(o.total).toLocaleString()} VNÐ</td>
            <td>${o.status}</td>
            <td>
                <button class="btn-accept" onclick="acceptOrder(${i})">Xác Nh?n</button>
                <button class="btn-delete" onclick="deleteOrder(${i})">Xoá</button>
            </td>
        </tr>`;
    });
}

// ================= 3. QU?N LÝ NGU?I DÙNG =================
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
        </tr>`;
    });
}

function deleteUser(i) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (!confirm("B?n có ch?c ch?n mu?n xóa user này?")) return;

    users.splice(i, 1);
    localStorage.setItem("users", JSON.stringify(users));
    loadUsers();
}

// ================= 4. QU?N LÝ S?N PH?M / XE (Firebase Realtime) =================
function saveProduct(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (isSaving) return;
    isSaving = true; 

    const file = document.getElementById("p-img").files[0];

    const carData = {
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

    if (editingFirebaseKey !== null && !file) {
        window.database.ref("products/" + editingFirebaseKey).update(carData)
        .then(() => {
            alert("Ðã c?p nh?t xe thành công!");
            isSaving = false;
            resetProductForm();
        }).catch(() => { isSaving = false; });
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        carData.image = event.target.result;

        if (editingFirebaseKey === null) {
            const newCarRef = window.database.ref("products").push();
            newCarRef.set(carData).then(() => {
                alert("Thêm xe m?i thành công!");
                isSaving = false;
                resetProductForm();
            }).catch(() => { isSaving = false; });
        } else {
            window.database.ref("products/" + editingFirebaseKey).set(carData).then(() => {
                alert("C?p nh?t thông tin và ?nh thành công!");
                isSaving = false;
                resetProductForm();
            }).catch(() => { isSaving = false; });
        }
    };
    reader.readAsDataURL(file);
}

function resetProductForm() {
    editingFirebaseKey = null;
    const form = document.getElementById("product-form");
    if (form) form.reset();
    
    document.getElementById("form-title").innerText = "Thêm S?n Ph?m M?i";
    document.getElementById("btn-submit-form").innerText = "Thêm S?n Ph?m";
    document.getElementById("p-img").required = true;
    showTab("xe");
}

// ---------------- LOAD XE & TÍCH H?P DATASET Ð? PHÂN TRANG ----------------
function loadCars() {
    const container = document.getElementById("admin-car-list");
    if (!container) return;

    const productsRef = window.database.ref("products");
    productsRef.off();

    productsRef.on("value", (snapshot) => {
        container.innerHTML = "";
        const productsData = snapshot.val();
        
        if (!productsData) {
            container.innerHTML = "<p style='text-align:center;'>Chua có xe nào trong h? th?ng.</p>";
            const chuyentrang = document.getElementById("chuyentrang");
            if (chuyentrang) chuyentrang.innerHTML = "";
            return;
        }

        // Render toàn b? xe ra HTML, m?c d?nh d?t dataset.show = "true"
        Object.keys(productsData).forEach((key) => {
            const car = productsData[key];
            
            container.innerHTML += `
            <div class="the" data-show="true">
                <div class="anhxe">
                    <img src="${car.image}" alt="${car.name}">
                    <div class="giatien">
                        ${Number(car.price).toLocaleString()} VNÐ
                    </div>
                </div>
                <div class="banduoi">
                    <h3>${car.name}</h3>
                    <p>
                        <strong>0-100:</strong> ${car.acceleration || "--"}&nbsp; | &nbsp;
                        <strong>T?i da:</strong> ${car.topspeed || "--"}
                    </p>
                    <div class="admin-action">
                        <button onclick="editCar('${key}')">S?a</button>
                        <button onclick="deleteCar('${key}')">Xóa</button>
                    </div>
                </div>
            </div>`;
        });

        // M?i l?n Firebase t?i/c?p nh?t d? li?u, ch?y l?i b? l?c tìm ki?m & phân trang
        timKiemXe();
    });
}

function deleteCar(key) {
    if (!confirm("B?n có ch?c mu?n xóa xe này kh?i h? th?ng?")) return;

    window.database.ref("products/" + key).remove()
    .then(() => {
        alert("Ðã xóa xe kh?i h? th?ng!");
    });
}

function editCar(key) {
    window.database.ref("products/" + key).once("value").then((snapshot) => {
        const car = snapshot.val();
        if (!car) return;

        editingFirebaseKey = key;
        showTab("sanpham");

        document.getElementById("p-name").value = car.name;
        document.getElementById("p-price").value = car.price;
        document.getElementById("p-category").value = car.category;
        document.getElementById("p-year").value = car.year || "";
        document.getElementById("p-engine").value = car.engine || "";
        document.getElementById("p-power").value = car.power || "";
        document.getElementById("p-gearbox").value = car.gearbox || "";
        document.getElementById("p-drive").value = car.drive || "";
        document.getElementById("p-acceleration").value = car.acceleration || "";
        document.getElementById("p-topspeed").value = car.topspeed || "";
        document.getElementById("p-description").value = car.description || "";

        document.getElementById("form-title").innerText = "S?a Thông Tin Xe";
        document.getElementById("btn-submit-form").innerText = "C?p Nh?t Xe";
        document.getElementById("p-img").required = false;
    });
}

// ---------------- 5. LOGIC TÌM KI?M XE ----------------
function timKiemXe() {
    const searchInput = document.getElementById("timkiemxe");
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const dsXe = document.querySelectorAll("#admin-car-list .the");

    dsXe.forEach(function (xe) {
        const tenXe = xe.querySelector("h3").textContent.toLowerCase();

        if (keyword === "" || tenXe.includes(keyword)) {
            xe.dataset.show = "true";
        } else {
            xe.dataset.show = "false";
        }
    });

    // Reset v? trang 1 m?i khi t? khóa tìm ki?m thay d?i
    currentPage = 1;
    pageGroup = 0;

    hienThiTrang(currentPage);
    taoPagination();
}

// ---------------- 6. LOGIC HI?N TH? TRANG ----------------
function hienThiTrang(page) {
    const cards = [...document.querySelectorAll("#admin-car-list .the")]
        .filter(card => card.dataset.show === "true");

    const totalCards = cards.length;
    
    // ?n toàn b? th? xe tru?c
    document.querySelectorAll("#admin-car-list .the").forEach(card => card.style.display = "none");

    // Ch? hi?n th? các th? xe thu?c trang hi?n t?i
    const startIndex = (page - 1) * cardsPerPage;
    const endIndex = Math.min(startIndex + cardsPerPage, totalCards);

    for (let i = startIndex; i < endIndex; i++) {
        if (cards[i]) {
            cards[i].style.display = "block"; // Ho?c "flex" tùy thu?c CSS layout c?a b?n
        }
    }
}

// ---------------- 7. LOGIC T?O THANH PHÂN TRANG (PAGINATION) ----------------
function taoPagination() {
    const cards = [...document.querySelectorAll("#admin-car-list .the")]
        .filter(card => card.dataset.show === "true");

    const totalPages = Math.ceil(cards.length / cardsPerPage);
    const chuyentrang = document.getElementById("chuyentrang");
    if (!chuyentrang) return;
    
    chuyentrang.innerHTML = "";

    // N?u không có s?n ph?m nào ho?c ch? có 1 trang thì không hi?n thanh phân trang
    if (totalPages <= 1) return;

    // Nút BACK (<) di chuy?n group trang
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

    // T?o các nút s? trang
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

    // Nút NEXT (>) di chuy?n group trang
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