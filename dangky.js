document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registerForm");
    const errorBox = document.getElementById("errorBox");
    const successBox = document.getElementById("successBox");

    if (errorBox) errorBox.style.display = "none";
    if (successBox) successBox.style.display = "none";

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!window.database) {
                showError("Hệ thống đang kết nối, vui lòng thử lại sau 2 giây!");
                return;
            }

            const fullName = document.getElementById("fullName").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;
            const confirm = document.getElementById("confirm").value;

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

            const submitBtn = form.querySelector("button[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Đang xử lý...";
            }

            showSuccess("Đang kiểm tra thông tin...");

            const usersRef = window.database.ref("users");

            // Kiểm tra trùng Email trực tiếp trên Firebase Cloud
            usersRef.orderByChild("email").equalTo(email).once("value")
                .then((emailSnapshot) => {
                    if (emailSnapshot.exists()) {
                        throw new Error("EMAIL_EXISTS");
                    }
                    // Kiểm tra trùng Số điện thoại trực tiếp trên Firebase Cloud
                    return usersRef.orderByChild("phone").equalTo(phone).once("value");
                })
                .then((phoneSnapshot) => {
                    if (phoneSnapshot.exists()) {
                        throw new Error("PHONE_EXISTS");
                    }

                    const newUser = {
                        fullName: fullName,
                        phone: phone,
                        email: email,
                        password: password.trim()
                    };

                    // Đẩy dữ liệu lên Cloud và CHỜ xác nhận từ máy chủ Firebase
                    return usersRef.push(newUser);
                })
                .then(() => {
                    showSuccess("Đăng ký thành công! Đang chuyển hướng...");

                    const currentUser = { fullName: fullName, email: email, phone: phone };
                    localStorage.setItem("isLogin", "true");
                    localStorage.setItem("currentUser", JSON.stringify(currentUser));
                    localStorage.setItem("role", "user");

                    setTimeout(() => {
                        window.location.href = "index.html"; 
                    }, 1500);
                })
                .catch((error) => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Đăng Ký";
                    }

                    if (error.message === "EMAIL_EXISTS") {
                        showError("Email này đã được sử dụng.");
                    } else if (error.message === "PHONE_EXISTS") {
                        showError("Số điện thoại này đã được sử dụng.");
                    } else {
                        showError("Lỗi đường truyền thiết bị: " + error.message);
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