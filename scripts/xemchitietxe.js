document.addEventListener("DOMContentLoaded", function () {
    // 1. Quản lý trạng thái Đăng nhập / Đăng xuất hiển thị góc trên trang
    const userBox = document.getElementById("userBox");
    if (userBox) {
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
    }

    // 2. Quản lý Popup/Form liên hệ mua xe
    const bang2 = document.getElementById("bang2");
    const dong = document.querySelector(".dong");

    if (dong && bang2) {
        dong.onclick = function () {
            bang2.style.display = "none";
        };
    }

    window.onclick = function (e) {
        if (e.target === bang2) {
            bang2.style.display = "none";
        }
    };

    // 3. LẤY CHI TIẾT XE TỪ FIREBASE THEO ID TRUYỀN SANG
    // ID lúc này là Firebase Key (dạng chuỗi ngẫu nhiên do push tạo ra)
    const firebaseKey = localStorage.getItem("selectedProductId");

    if (!firebaseKey) {
        alert("Không tìm thấy thông tin xe!");
        window.location.href = "index.html";
        return;
    }

    // Truy vấn trực tiếp từ nhánh products/ID_CỦA_XE trên Firebase
    window.database.ref("products/" + firebaseKey).once("value").then((snapshot) => {
        const product = snapshot.val();

        if (!product) {
            alert("Sản phẩm không tồn tại hoặc đã bị xóa!");
            window.location.href = "index.html";
            return;
        }

        // Đổ toàn bộ dữ liệu thời gian thực từ Firebase lên giao diện
        if (document.getElementById("anhXe")) {
            document.getElementById("anhXe").src = product.image;
        }
        if (document.getElementById("tenXe")) {
            document.getElementById("tenXe").innerText = product.name;
        }
        if (document.getElementById("giaXe")) {
            document.getElementById("giaXe").innerText = Number(product.price).toLocaleString() + " VNĐ";
        }
        if (document.getElementById("hangXe")) {
            document.getElementById("hangXe").innerText = product.category;
        }
        
        // Đổ các thông số kỹ thuật
        setElementText("year", product.year);
        setElementText("engine", product.engine);
        setElementText("power", product.power);
        setElementText("gearbox", product.gearbox);
        setElementText("drive", product.drive);
        setElementText("acceleration", product.acceleration);
        setElementText("topspeed", product.topspeed);
        setElementText("description", product.description, "Chưa có mô tả");
    }).catch((error) => {
        console.error("Lỗi khi tải chi tiết xe:", error);
    });
});

// Hàm hỗ trợ gán text nhanh, nếu rỗng thì ghi "Chưa cập nhật"
function setElementText(id, value, fallback = "Chưa cập nhật") {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = value || fallback;
    }
}

// 4. Hàm xử lý khi ấn nút "Liên hệ"
function lienHe() {
    const isLogin = localStorage.getItem("isLogin");

    if (isLogin !== "true") {
        alert("Vui lòng đăng nhập để liên hệ với shop!");
        window.location.href = "dangnhap.html";
        return;
    }

    const bang2 = document.getElementById("bang2");
    if (bang2) {
        bang2.style.display = "flex";
    }
}
window.lienHe = lienHe;