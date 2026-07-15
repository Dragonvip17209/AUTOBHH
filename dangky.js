document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registerForm");
    const errorBox = document.getElementById("errorBox");
    const successBox = document.getElementById("successBox");

    if (form) {

        form.addEventListener("submit", function (e) {

            e.preventDefault();

            const fullName = document.getElementById("fullName").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const confirm = document.getElementById("confirm").value;

            errorBox.style.display = "none";
            successBox.style.display = "none";

            if (password.length < 6) {
                errorBox.innerText = "Mật khẩu phải từ 6 ký tự trở lên.";
                errorBox.style.display = "block";
                return;
            }

            if (password !== confirm) {
                errorBox.innerText = "Mật khẩu nhập lại không khớp.";
                errorBox.style.display = "block";
                return;
            }

            // Lấy danh sách tài khoản đã lưu
            let users = JSON.parse(localStorage.getItem("users")) || [];

            // Kiểm tra email đã tồn tại
            const emailExists = users.some(user => user.email === email);

            if (emailExists) {
                errorBox.innerText = "Email đã tồn tại.";
                errorBox.style.display = "block";
                return;
            }

            // Tạo tài khoản mới
            const user = {
                fullName,
                phone,
                email,
                password
            };

            // Thêm vào danh sách
            users.push(user);

            // Lưu lại
            localStorage.setItem("users", JSON.stringify(users));

            successBox.innerText =
                "Đăng ký thành công! Đang chuyển sang đăng nhập...";
            successBox.style.display = "block";

            setTimeout(() => {
                window.location.href = "dangnhap.html";
            }, 2000);

        });

    }

    // Chỉ chạy nếu trang có userBox
    const userBox = document.getElementById("userBox");

    if (userBox) {

        const isLogin = localStorage.getItem("isLogin");
        const currentUser =
            JSON.parse(localStorage.getItem("currentUser"));

        if (isLogin === "true" && currentUser) {

            userBox.innerHTML = `
                <div class="user-info">
                    <span>${currentUser.fullName}</span>
                    <button id="logoutBtn">Đăng xuất</button>
                </div>
            `;

            const logoutBtn =
                document.getElementById("logoutBtn");

            if (logoutBtn) {
                logoutBtn.addEventListener("click", function () {

                    localStorage.removeItem("isLogin");
                    localStorage.removeItem("currentUser");

                    window.location.href = "dangnhap.html";
                });
            }

        } else {

            userBox.innerHTML = `
                <a href="dangnhap.html">Đăng nhập</a>
            `;
        }
    }

});
console.log(
    JSON.stringify(
        JSON.parse(localStorage.getItem("users")),
        null,
        2
    )
);