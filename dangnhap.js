document.addEventListener("DOMContentLoaded", function () {

    const loginBtn = document.getElementById("loginBtn");
    const userBox = document.getElementById("userBox");
    const loginMessage = document.getElementById("loginMessage");

    // ================= 1. HIỂN THỊ TRẠNG THÁI ĐĂNG NHẬP =================
    const isLogin = localStorage.getItem("isLogin");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (userBox) {
        if (isLogin === "true" && currentUser) {
            userBox.innerHTML = `
                <span>${currentUser.fullName}</span>
                <a href="#" id="logoutBtn">Đăng xuất</a>
            `;

            document.getElementById("logoutBtn").addEventListener("click", function (e) {
                e.preventDefault();

                localStorage.removeItem("isLogin");
                localStorage.removeItem("currentUser");
                localStorage.removeItem("role");

                location.reload();
            });
        } else {
            userBox.innerHTML = `
                <a href="dangnhap.html">Đăng nhập</a>
            `;
        }
    }

    // ================= 2. XỬ LÝ ĐĂNG NHẬP (FIREBASE) =================
    if (loginBtn) {
        loginBtn.addEventListener("click", function () {

            const account = document.getElementById("loginAccount").value.trim();
            const password = document.getElementById("loginPassword").value;

            if (loginMessage) loginMessage.innerHTML = ""; // Reset thông báo lỗi

            // ===== ADMIN CỐ ĐỊNH =====
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

            // ===== USER THƯỜNG (Lấy dữ liệu từ Firebase) =====
            window.database.ref("users").once("value")
                .then((snapshot) => {
                    const usersData = snapshot.val() || {};
                    
                    // Tìm user có email hoặc số điện thoại trùng khớp và kiểm tra mật khẩu
                    const foundUserKey = Object.keys(usersData).find(key => {
                        const user = usersData[key];
                        const isAccountMatch = (user.email === account || user.phone === account);
                        const isPasswordMatch = (user.password === password);
                        return isAccountMatch && isPasswordMatch;
                    });

                    if (foundUserKey) {
                        // Tìm thấy user hợp lệ -> Lưu trạng thái đăng nhập vào localStorage
                        const loggedInUser = usersData[foundUserKey];

                        localStorage.setItem("isLogin", "true");
                        localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
                        localStorage.setItem("role", "user");

                        window.location.href = "index.html";
                    } else {
                        // Sai tài khoản hoặc mật khẩu
                        showLoginError("Sai tài khoản hoặc mật khẩu!");
                    }
                })
                .catch((error) => {
                    showLoginError("Lỗi kết nối hệ thống: " + error.message);
                });
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