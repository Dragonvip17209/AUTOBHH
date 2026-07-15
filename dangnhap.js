document.addEventListener("DOMContentLoaded", function () {

    const loginBtn = document.getElementById("loginBtn");
    const userBox = document.getElementById("userBox");
    const loginMessage = document.getElementById("loginMessage");

    // Hiển thị người dùng đã đăng nhập
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

    // Đăng nhập
    if (loginBtn) {

        loginBtn.addEventListener("click", function () {

            const account =
                document.getElementById("loginAccount").value.trim();

            const password =
                document.getElementById("loginPassword").value;

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

            // ===== USER THƯỜNG =====
            const users =
                JSON.parse(localStorage.getItem("users")) || [];

            const currentUser = users.find(user =>
                (user.email === account ||
                    user.phone === account) &&
                user.password === password
            );

            if (currentUser) {

                localStorage.setItem("isLogin", "true");

                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(currentUser)
                );

                localStorage.setItem("role", "user");

                window.location.href = "index.html";

            } else {

                if (loginMessage) {
                    loginMessage.innerHTML =
                        "Sai tài khoản hoặc mật khẩu!";
                } else {
                    alert("Sai tài khoản hoặc mật khẩu!");
                }
            }

        });

    }

});