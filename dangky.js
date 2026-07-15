document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registerForm");
    const errorBox = document.getElementById("errorBox");
    const successBox = document.getElementById("successBox");

    // Tự động ẩn các hộp thông báo lỗi/thành công khi load trang
    if (errorBox) errorBox.style.display = "none";
    if (successBox) successBox.style.display = "none";

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            // KIỂM TRA ĐỀ PHÒNG FIREBASE CHƯA KHỞI TẠO XONG
            if (!window.database) {
                showError("Hệ thống đang khởi động, vui lòng thử lại sau 2 giây!");
                return;
            }

            const fullName = document.getElementById("fullName").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;
            const confirm = document.getElementById("confirm").value;

            // 1. Kiểm tra không được bỏ trống thông tin
            if (!fullName || !phone || !email || !password || !confirm) {
                showError("Vui lòng điền đầy đủ tất cả các trường thông tin.");
                return;
            }

            // 2. Kiểm tra định dạng số điện thoại cơ bản (ít nhất 9-11 số)
            const phoneRegex = /^[0-9]{9,11}$/;
            if (!phoneRegex.test(phone)) {
                showError("Số điện thoại không hợp lệ (Chỉ nhập số, từ 9-11 ký tự).");
                return;
            }

            // 3. Kiểm tra độ dài mật khẩu
            if (password.length < 6) {
                showError("Mật khẩu phải từ 6 ký tự trở lên.");
                return;
            }

            // 4. Kiểm tra mật khẩu khớp nhau
            if (password !== confirm) {
                showError("Mật khẩu nhập lại không khớp.");
                return;
            }

            // Vô hiệu hóa nút Đăng ký để chống bấm đúp gửi dữ liệu trùng
            const submitBtn = form.querySelector("button[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Đang xử lý...";
            }

            showSuccess("Đang kiểm tra thông tin trên hệ thống...");

            // ================= LOGIC FIREBASE REALTIME DATABASE =================
            window.database.ref("users").once("value")
                .then((snapshot) => {
                    const usersData = snapshot.val() || {};

                    // Kiểm tra trùng Email
                    const emailExists = Object.values(usersData).some(user => {
                        return user.email && user.email.toLowerCase().trim() === email;
                    });

                    if (emailExists) {
                        throw new Error("EMAIL_EXISTS");
                    }

                    // Kiểm tra trùng Số điện thoại
                    const phoneExists = Object.values(usersData).some(user => {
                        return user.phone && user.phone.trim() === phone;
                    });

                    if (phoneExists) {
                        throw new Error("PHONE_EXISTS");
                    }

                    // Tạo đối tượng thành viên mới
                    const newUser = {
                        fullName: fullName,
                        phone: phone,
                        email: email,
                        password: password.trim() // Trim mật khẩu để tránh khoảng trắng thừa do gõ lỗi
                    };

                    // Đẩy dữ liệu lên nhánh "users" trên Firebase
                    return window.database.ref("users").push(newUser);
                })
                .then(() => {
    // 1. Đổi thông báo và chuyển hướng thẳng sang index.html (trang chủ) vì đã có data đăng nhập
    showSuccess("Đăng ký tài khoản thành công! Đang chuyển hướng về trang chủ...");

    // 2. TỰ ĐỘNG ĐĂNG NHẬP LUÔN CHO KHÁCH HÀNG
    const currentUser = {
        fullName: fullName,
        email: email,
        phone: phone
    };
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("role", "user"); // Lưu thêm role để đồng bộ với file dangnhap.js của bạn

    // 3. Đá thẳng về trang chủ sau 2 giây
    setTimeout(() => {
        window.location.href = "index.html"; 
    }, 1);
})
                .catch((error) => {
                    // Mở lại nút bấm khi gặp lỗi để người dùng sửa thông tin và gửi lại
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Đăng Ký";
                    }

                    if (error.message === "EMAIL_EXISTS") {
                        showError("Email này đã được sử dụng trên hệ thống.");
                    } else if (error.message === "PHONE_EXISTS") {
                        showError("Số điện thoại này đã được sử dụng trên hệ thống.");
                    } else {
                        showError("Lỗi kết nối máy chủ: " + error.message);
                    }
                });
        });
    }

    // Các hàm phụ hiển thị thông báo đẹp mắt
    function showError(msg) {
        if (!errorBox) return;
        errorBox.innerText = msg;
        errorBox.style.display = "block";
        if (successBox) successBox.style.display = "none";
    }

    function showSuccess(msg) {
        if (!successBox) return;
        successBox.innerText = msg;
        successBox.style.display = "block";
        if (errorBox) errorBox.style.display = "none";
    }

    // ================= HIỂN THỊ TRẠNG THÁI KHÁCH HÀNG (USERBOX) =================
    const userBox = document.getElementById("userBox");

    if (userBox) {
        const isLogin = localStorage.getItem("isLogin");
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));

        if (isLogin === "true" && currentUser) {
            userBox.innerHTML = `
                <div class="user-info">
                    <span>Xin chào, <strong>${currentUser.fullName}</strong></span>
                    <button id="logoutBtn" style="margin-left: 10px;">Đăng xuất</button>
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