// TỰ ĐỘNG CHUYỂN HƯỚNG NẾU ĐÃ ĐĂNG NHẬP RỒI
if (isLogin === "true" && currentUser) {
    // Nếu là admin, đẩy về trang admin
    if (localStorage.getItem("role") === "admin") {
        window.location.href = "Admin.html";
    } else {
        // Nếu là user thường, đẩy về trang chủ
        window.location.href = "index.html"; 
    }
    return; // Dừng thực thi các đoạn code phía dưới form
}
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");
    const userBox = document.getElementById("userBox");
    const loginMessage = document.getElementById("loginMessage");

    // ================= 1. HIỂN THỊ TRẠNG THÁI ĐĂNG NHẬP Ở HEADER =================
    const isLogin = localStorage.getItem("isLogin");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (userBox) {
        if (isLogin === "true" && currentUser) {
            userBox.innerHTML = `
                <span>Xin chào, <strong>${currentUser.fullName}</strong></span>
                <a href="#" id="logoutBtn" style="margin-left: 10px; color: red;">Đăng xuất</a>
            `;

            const logoutBtn = document.getElementById("logoutBtn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", function (e) {
                    e.preventDefault();

                    localStorage.removeItem("isLogin");
                    localStorage.removeItem("currentUser");
                    localStorage.removeItem("role");

                    location.reload();
                });
            }
        } else {
            userBox.innerHTML = `
                <a href="dangnhap.html">Đăng nhập</a>
            `;
        }
    }
    // ================= 2. XỬ LÝ ĐĂNG NHẬP (FIREBASE) =================
    function thucHienDangNhap() {
        // KIỂM TRA ĐỀ PHÒNG FIREBASE CHƯA TẢI XONG
        if (!window.database) {
            showLoginError("Hệ thống đang khởi động, vui lòng thử lại sau 2 giây!");
            return;
        }

        const accountInput = document.getElementById("loginAccount");
        const passwordInput = document.getElementById("loginPassword");

        if (!accountInput || !passwordInput) return;

        const account = accountInput.value.trim().toLowerCase(); 
        const password = passwordInput.value.trim(); // Thêm .trim() để loại bỏ dấu cách thừa

        if (account === "" || password === "") {
            showLoginError("Vui lòng điền đầy đủ tài khoản và mật khẩu.");
            return;
        }

        if (loginMessage) loginMessage.innerHTML = "<span style='color: #ff9800;'>Đang xác thực thông tin...</span>"; 

        // Vô hiệu hóa nút bấm tạm thời tránh việc người dùng click liên tục
        const activeBtn = loginForm ? loginForm.querySelector("button[type='submit']") : loginBtn;
        if (activeBtn) activeBtn.disabled = true;

        // ===== TRƯỜNG HỢP: ADMIN CỐ ĐỊNH =====
        if (account === "admin" && password === "admin@dragon") {
            localStorage.setItem("isLogin", "true");
            localStorage.setItem("role", "admin");
            localStorage.setItem("currentUser", JSON.stringify({
                fullName: "Administrator",
                email: "admin@gmail.com"
            }));

            window.location.href = "Admin.html";
            return;
        }

        // ===== TRƯỜNG HỢP: USER THƯỜNG (Firebase) =====
        window.database.ref("users").once("value")
            .then((snapshot) => {
                if (activeBtn) activeBtn.disabled = false;
                const usersData = snapshot.val() || {};
                
                // Tìm kiếm thông tin khớp tài khoản
                const foundUserKey = Object.keys(usersData).find(key => {
                    const user = usersData[key];
                    
                    const userEmail = user.email ? user.email.toLowerCase().trim() : "";
                    const userPhone = user.phone ? user.phone.toLowerCase().trim() : "";
                    const userPassword = user.password ? user.password.trim() : ""; // Cắt khoảng trắng đầu đuôi của DB
                    
                    const isAccountMatch = (userEmail === account || userPhone === account);
                    const isPasswordMatch = (userPassword === password);
                    
                    return isAccountMatch && isPasswordMatch;
                });

                if (foundUserKey) {
                    const loggedInUser = usersData[foundUserKey];

                    localStorage.setItem("isLogin", "true");
                    localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
                    localStorage.setItem("role", "user");

                    if (loginMessage) loginMessage.innerHTML = "<span style='color: green;'>Đăng nhập thành công! Đang chuyển hướng...</span>";

                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1000);
                } else {
                    showLoginError("Tài khoản hoặc mật khẩu không chính xác!");
                }
            })
            .catch((error) => {
                if (activeBtn) activeBtn.disabled = false;
                showLoginError("Lỗi kết nối máy chủ: " + error.message);
            });
    }

    // Gán sự kiện cho Form / Button
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            thucHienDangNhap();
        });
    } else if (loginBtn) {
        loginBtn.addEventListener("click", function (e) {
            e.preventDefault();
            thucHienDangNhap();
        });
    }

    // Hàm phụ hiển thị lỗi đẹp mắt trực tiếp trên form
    function showLoginError(msg) {
        if (loginMessage) {
            loginMessage.innerHTML = `<span style="color: red; font-weight: bold;">${msg}</span>`;
        } else {
            alert(msg);
        }
    }
});