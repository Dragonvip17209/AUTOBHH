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

            // Ẩn các hộp thông báo lỗi/thành công trước đó
            errorBox.style.display = "none";
            successBox.style.display = "none";

            // 1. Kiểm tra độ dài mật khẩu
            if (password.length < 6) {
                errorBox.innerText = "Mật khẩu phải từ 6 ký tự trở lên.";
                errorBox.style.display = "block";
                return;
            }

            // 2. Kiểm tra mật khẩu khớp nhau
            if (password !== confirm) {
                errorBox.innerText = "Mật khẩu nhập lại không khớp.";
                errorBox.style.display = "block";
                return;
            }

            // ================= LOGIC FIREBASE REALTIME DATABASE =================
            // Đọc toàn bộ nhánh "users" trên Firebase để đối chiếu trùng lặp email
            window.database.ref("users").once("value")
                .then((snapshot) => {
                    const usersData = snapshot.val() || {};

                    // Kiểm tra email đã tồn tại hay chưa
                    const emailExists = Object.values(usersData).some(user => user.email === email);

                    if (emailExists) {
                        errorBox.innerText = "Email đã tồn tại trên hệ thống.";
                        errorBox.style.display = "block";
                        // Trả về một giá trị đặc biệt hoặc reject để ngắt chuỗi promise tiếp theo
                        return Promise.reject("EMAIL_EXISTS");
                    }

                    // Tạo đối tượng thành viên mới
                    const newUser = {
                        fullName: fullName,
                        phone: phone,
                        email: email,
                        password: password
                    };

                    // Đẩy dữ liệu lên nhánh "users"
                    return window.database.ref("users").push(newUser);
                })
                .then((ref) => {
                    // Nếu đẩy thành công
                    successBox.innerText = "Đăng ký thành công! Đang chuyển sang đăng nhập...";
                    successBox.style.display = "block";

                    setTimeout(() => {
                        window.location.href = "dangnhap.html";
                    }, 2000);
                })
                .catch((error) => {
                    if (error === "EMAIL_EXISTS") return; // Lỗi này đã được xử lý hiển thị ở trên
                    
                    errorBox.innerText = "Có lỗi xảy ra: " + error.message;
                    errorBox.style.display = "block";
                });
        });
    }

    // ================= HIỂN THỊ TRẠNG THÁI KHÁCH HÀNG (USERBOX) =================
    const userBox = document.getElementById("userBox");

    if (userBox) {
        const isLogin = localStorage.getItem("isLogin");
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));

        if (isLogin === "true" && currentUser) {
            userBox.innerHTML = `
                <div class="user-info">
                    <span>${currentUser.fullName}</span>
                    <button id="logoutBtn">Đăng xuất</button>
                </div>
            `;

            const logoutBtn = document.getElementById("logoutBtn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", function () {
                    localStorage.removeItem("isLogin");
                    localStorage.removeItem("currentUser");
                    window.location.href = "dangnhap.html";
                });
            }
        } else {
            userBox.innerHTML = `<a href="dangnhap.html">Đăng nhập</a>`;
        }
    }
});