document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registerForm");
    const errorBox = document.getElementById("errorBox");
    const successBox = document.getElementById("successBox");

    if (errorBox) errorBox.style.display = "none";
    if (successBox) successBox.style.display = "none";

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            // Cơ chế tự động chờ nếu Firebase khởi tạo chậm 1-2 giây
            if (!window.database) {
                showError("Hệ thống đang kết nối dữ liệu đám mây, vui lòng thử lại sau vài giây!");
                return;
            }

            const fullName = document.getElementById("fullName").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;
            const confirm = document.getElementById("confirm").value;

            // --- KIỂM TRA ĐẦU VÀO FORM ---
            if (!fullName || !phone || !email || !password || !confirm) {
                showError("Vui lòng điền đầy đủ tất cả các trường thông tin.");
                return;
            }

            const phoneRegex = /^[0-9]{9,11}$/;
            if (!phoneRegex.test(phone)) {
                showError("Số điện thoại không hợp lệ (Chỉ nhập số, từ 9-11 ký tự).");
                return;
            }

            if (password.length < 6) {
                showError("Mật khẩu phải từ 6 ký tự trở lên.");
                return;
            }

            if (password !== confirm) {
                showError("Mật khẩu nhập lại không khớp.");
                return;
            }

            // Chặn người dùng bấm liên tục khi đang xử lý gửi dữ liệu
            const submitBtn = form.querySelector("button[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Đang kiểm tra tài khoản...";
            }

            showSuccess("Đang xác thực với máy chủ...");

            const usersRef = window.database.ref("users");

            // Lớp kiểm tra 1: Trùng Email trực tiếp trên Realtime Cloud
            usersRef.orderByChild("email").equalTo(email).once("value")
                .then((emailSnapshot) => {
                    if (emailSnapshot.exists()) {
                        throw new Error("EMAIL_EXISTS");
                    }
                    // Lớp kiểm tra 2: Trùng Số điện thoại trực tiếp trên Realtime Cloud
                    return usersRef.orderByChild("phone").equalTo(phone).once("value");
                })
                .then((phoneSnapshot) => {
                    if (phoneSnapshot.exists()) {
                        throw new Error("PHONE_EXISTS");
                    }

                    // Chuẩn bị object lưu trữ sạch để đẩy lên Firebase
                    const newUser = {
                        fullName: fullName,
                        phone: phone,
                        email: email,
                        password: password.trim()
                    };

                    // Đẩy dữ liệu trực tiếp lên nhánh "users" và ĐỢI phản hồi thành công từ đám mây
                    return usersRef.push(newUser);
                })
                .then(() => {
                    showSuccess("Đăng ký thành công! Đang chuyển hướng về trang chủ...");

                    // Lưu cục bộ để duy trì phiên đăng nhập cho trình duyệt máy phụ
                    const currentUser = { fullName: fullName, email: email, phone: phone };
                    localStorage.setItem("isLogin", "true");
                    localStorage.setItem("currentUser", JSON.stringify(currentUser));
                    localStorage.setItem("role", "user");

                    // Chuyển hướng sau 1.5 giây để tạo trải nghiệm mượt mà
                    setTimeout(() => {
                        window.location.href = "index.html"; 
                    }, 1500);
                })
                .catch((error) => {
                    // Mở lại nút bấm nếu quá trình đăng ký bị lỗi
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Tạo tài khoản";
                    }

                    if (error.message === "EMAIL_EXISTS") {
                        showError("Email này đã được sử dụng.");
                    } else if (error.message === "PHONE_EXISTS") {
                        showError("Số điện thoại này đã được sử dụng.");
                    } else {
                        showError("Lỗi kết nối hoặc Firebase Rules chặn: " + error.message);
                    }
                });
        });
    }

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
});