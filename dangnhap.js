document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm"); // Nên bọc form đăng nhập bằng thẻ <form id="loginForm">
    const loginBtn = document.getElementById("loginBtn");
    const userBox = document.getElementById("userBox");
    const loginMessage = document.getElementById("loginMessage");

    // ================= 1. HIỂN THỊ TRẠNG THÁI ĐĂNG NHẬP Ở HEADER =================
    const isLogin = localStorage.getItem("isLogin");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (userBox) {
        if (isLogin === "true" && currentUser) {
            userBox.innerHTML = `
                <span>${currentUser.fullName}</span>
                <a href="#" id="logoutBtn">Đăng xuất</a>
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
    // Hàm thực hiện đăng nhập chính
    function thucHienDangNhap() {
        const accountInput = document.getElementById("loginAccount");
        const passwordInput = document.getElementById("loginPassword");

        if (!accountInput || !passwordInput) return;

        const account = accountInput.value.trim().toLowerCase(); // Chuyển thông tin nhập về chữ thường
        const password = passwordInput.value;

        if (loginMessage) loginMessage.innerHTML = ""; // Reset thông báo lỗi trước đó

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
                const usersData = snapshot.val() || {};
                
                // Tìm kiếm thông tin khớp tài khoản
                const foundUserKey = Object.keys(usersData).find(key => {
                    const user = usersData[key];
                    
                    // Đưa email và số điện thoại trên db về dạng chữ thường an toàn
                    const userEmail = user.email ? user.email.toLowerCase().trim() : "";
                    const userPhone = user.phone ? user.phone.toLowerCase().trim() : "";
                    
                    const isAccountMatch = (userEmail === account || userPhone === account);
                    const isPasswordMatch = (user.password === password);
                    
                    return isAccountMatch && isPasswordMatch;
                });

                if (foundUserKey) {
                    // Đăng nhập thành công -> Lưu dữ liệu session
                    const loggedInUser = usersData[foundUserKey];

                    localStorage.setItem("isLogin", "true");
                    localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
                    localStorage.setItem("role", "user");

                    window.location.href = "index.html";
                } else {
                    showLoginError("Sai tài khoản hoặc mật khẩu!");
                }
            })
            .catch((error) => {
                showLoginError("Lỗi kết nối hệ thống: " + error.message);
            });
    }

    // Gán sự kiện submit vào Form (Nếu có thẻ Form) để hỗ trợ cả nút bấm lẫn phím Enter
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            thucHienDangNhap();
        });
    } else if (loginBtn) {
        // Dự phòng nếu giao diện của bạn không dùng thẻ <form>, gán sự kiện click vào button
        loginBtn.addEventListener("click", function (e) {
            e.preventDefault();
            thucHienDangNhap();
        });
    }

    // Hàm phụ hiển thị lỗi đăng nhập nhanh
    function showLoginError(msg) {
        if (loginMessage) {
            loginMessage.innerHTML = msg;
        } else {
            alert(msg);
        }
    }
});