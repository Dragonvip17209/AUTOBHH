let editingFirebaseKey = null;
let currentProductId = null;
let isSaving = false; // Biến cờ (flag) chặn đứng việc submit đúp 

// Các biến cấu hình phân trang cho danh sách Xe của Admin
let currentPage = 1;
const cardsPerPage = 12;
let pageGroup = 0;
const maxPageShow = 3;

// ================= KHỞI TẠO TRANG ADMIN =================
document.addEventListener("DOMContentLoaded", function () {
    showTab("sanpham");
    loadUsers();
    loadOrders();
    loadCars();  

    // Gán sự kiện submit cho form thêm/sửa sản phẩm
    const productForm = document.getElementById("product-form");
    if (productForm) {
        productForm.removeEventListener("submit", saveProduct);
        productForm.addEventListener("submit", saveProduct);
    }

    // Gán sự kiện submit cho form đặt đơn hàng
    const orderForm = document.getElementById("order-form");
    if (orderForm) {
        orderForm.addEventListener("submit", saveOrderSubmit);
    }

    // Gán sự kiện tìm kiếm xe trong tab Quản Lý Xe
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

// ================= 1. CHUYỂN ĐỔI TAB QUẢN LÝ =================
function showTab(name) {
    document.querySelectorAll(".noidung").forEach(t => t.classList.remove("active"));

    const tab = document.getElementById("tab-" + name);
    if (tab) tab.classList.add("active");
    
    const title = document.getElementById("page-title");
    if (title) {
        if (name === "sanpham") title.innerText = "Quản Lý Sản Phẩm";
        if (name === "nguoidung") title.innerText = "Quản Lý Khách Hàng";
        if (name === "donhang") title.innerText = "Quản Lý Đơn Hàng";
        if (name === "xe") title.innerText = "Quản Lý Xe";
    }
}

// ================= 2. QUẢN LÝ ĐƠN HÀNG =================
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
        status: "Chờ xác nhận"
    };

    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    const form = document.getElementById("order-form");
    if (form) form.reset();
    
    document.getElementById("order-form-box").style.display = "none";

    loadOrders();
    alert("Đã lưu đơn thành công!");
}

function acceptOrder(index) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    if (!orders[index]) return;

    orders[index].status = "Đã xác nhận";
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
    alert("Đã xác nhận đơn hàng thành công!");
}

function deleteOrder(index) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    if (!confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) return;

    orders.splice(index, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
    alert("Đã xóa đơn hàng thành công!");
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
            <td>${Number(o.total).toLocaleString()} VNĐ</td>
            <td>${o.status}</td>
            <td>
                <button class="btn-accept" onclick="acceptOrder(${i})">Xác Nhận</button>
                <button class="btn-delete" onclick="deleteOrder(${i})">Xoá</button>
            </td>
        </tr>`;
    });
}

// ================= 3. QUẢN LÝ NGƯỜI DÙNG =================
function loadUsers() {
    const tbody = document.getElementById("user-table-body");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; font-style:italic;">Đang kết nối tới máy chủ Firebase...</td></tr>`;

    if (!window.database) {
        setTimeout(loadUsers, 1000);
        return;
    }

    const usersRef = window.database.ref("users");
    usersRef.off();

    usersRef.on("value", (snapshot) => {
        tbody.innerHTML = "";
        const usersData = snapshot.val();

        console.log("Dữ liệu Users nhận được từ Firebase:", usersData);

        if (!usersData) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: #ff9800;">Firebase kết nối OK nhưng chưa có ai đăng ký.</td></tr>`;
            return;
        }

        let index = 1;
        Object.keys(usersData).forEach((key) => {
            const u = usersData[key];
            tbody.innerHTML += `
            <tr>
                <td>${index++}</td>
                <td>${u.fullName || "N/A"}</td>
                <td>${u.email || "N/A"}</td>
                <td>${u.phone || "N/A"}</td>
                <td>${u.password || "N/A"}</td>
                <td>
                    <button class="btn-delete" onclick="deleteFirebaseUser('${key}')">Xóa</button>
                </td>
            </tr>`;
        });
    }, (error) => {
        console.error("Lỗi Firebase:", error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red; font-weight:bold;">Lỗi bảo mật Rules hoặc cấu hình: ${error.message}</td></tr>`;
    });
}

// ✨ BỔ SUNG HÀM XÓA USER TRÊN MÁY CHỦ FIREBASE TOÀN CỤC
window.deleteFirebaseUser = function(key) {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản người dùng này không?")) return;

    if (!window.database) {
        alert("Hệ thống chưa kết nối xong với Firebase!");
        return;
    }

    window.database.ref("users/" + key).remove()
        .then(() => {
            alert("Đã xóa tài khoản người dùng thành công!");
        })
        .catch((error) => {
            alert("Không thể xóa user: " + error.message);
        });
};

// ================= 4. QUẢN LÝ SẢN PHẨM / XE (Firebase Realtime) =================
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
            alert("Đã cập nhật xe thành công!");
            isSaving = false;
            resetProductForm();
        }).catch(() => { isSaving = false; });
        return;
    }

    if (!file) {
        alert("Vui lòng chọn hình ảnh cho xe!");
        isSaving = false;
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        carData.image = event.target.result;

        if (editingFirebaseKey === null) {
            const newCarRef = window.database.ref("products").push();
            newCarRef.set(carData).then(() => {
                alert("Thêm xe mới thành công!");
                isSaving = false;
                resetProductForm();
            }).catch(() => { isSaving = false; });
        } else {
            window.database.ref("products/" + editingFirebaseKey).set(carData).then(() => {
                alert("Cập nhật thông tin và ảnh thành công!");
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
    
    document.getElementById("form-title").innerText = "Thêm Sản Phẩm Mới";
    document.getElementById("btn-submit-form").innerText = "Thêm Sản Phẩm";
    document.getElementById("p-img").required = true;
    showTab("xe");
}

function loadCars() {
    const container = document.getElementById("admin-car-list");
    if (!container) return;

    const productsRef = window.database.ref("products");
    productsRef.off();

    productsRef.on("value", (snapshot) => {
        container.innerHTML = ""; // 👍 FIX LỖI: Reset danh sách cũ để chống lặp thẻ xe khi update
        const productsData = snapshot.val();
        
        if (!productsData) {
            container.innerHTML = "<p style='text-align:center;'>Chưa có xe nào trong hệ thống.</p>";
            const chuyentrang = document.getElementById("chuyentrang");
            if (chuyentrang) chuyentrang.innerHTML = "";
            return;
        }

        Object.keys(productsData).forEach((key) => {
            const car = productsData[key];
            
            container.innerHTML += `
            <div class="the" data-show="true">
                <div class="anhxe">
                    <img src="${car.image}" alt="${car.name}">
                    <div class="giatien">
                        ${Number(car.price).toLocaleString()} VNĐ
                    </div>
                </div>
                <div class="banduoi">
                    <h3>${car.name}</h3>
                    <p>
                        <strong>0-100:</strong> ${car.acceleration || "--"}&nbsp; | &nbsp;
                        <strong>Tối đa:</strong> ${car.topspeed || "--"}
                    </p>
                    <div class="admin-action">
                        <button onclick="editCar('${key}')">Sửa</button>
                        <button onclick="deleteCar('${key}')">Xóa</button>
                    </div>
                </div>
            </div>`;
        });

        timKiemXe();
    });
}

// Đăng ký toàn cục các hàm gọi từ thuộc tính HTML inline (onclick) để tránh lỗi scope trên môi trường module/online
window.deleteCar = function(key) {
    if (!confirm("Bạn có chắc muốn xóa xe này khỏi hệ thống?")) return;
    window.database.ref("products/" + key).remove().then(() => { alert("Đã xóa xe khỏi hệ thống!"); });
};

window.editCar = function(key) {
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

        document.getElementById("form-title").innerText = "Sửa Thông Tin Xe";
        document.getElementById("btn-submit-form").innerText = "Cập Nhật Xe";
        document.getElementById("p-img").required = false;
    });
};

// ================= 5. LOGIC TÌM KIẾM XE =================
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

    currentPage = 1;
    pageGroup = 0;

    hienThiTrang(currentPage);
    taoPagination();
}

// ================= 6. LOGIC HIỂN THỊ TRANG =================
function hienThiTrang(page) {
    const cards = [...document.querySelectorAll("#admin-car-list .the")]
        .filter(card => card.dataset.show === "true");

    const totalCards = cards.length;
    
    document.querySelectorAll("#admin-car-list .the").forEach(card => card.style.display = "none");

    const startIndex = (page - 1) * cardsPerPage;
    const endIndex = Math.min(startIndex + cardsPerPage, totalCards);

    for (let i = startIndex; i < endIndex; i++) {
        if (cards[i]) {
            cards[i].style.display = "block";
        }
    }
}

// ================= 7. LOGIC TẠO THANH PHÂN TRANG (PAGINATION) =================
function taoPagination() {
    const cards = [...document.querySelectorAll("#admin-car-list .the")]
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