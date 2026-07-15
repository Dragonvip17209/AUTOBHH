// Biến lưu trữ Key Firebase của User tìm thấy thay vì dùng Index trong mảng
let foundUserFirebaseKey = null;

document.addEventListener("DOMContentLoaded", function () {

    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const errorBox = document.getElementById("errorBox");
    const successBox = document.getElementById("successBox");

    // Tự động ẩn các hộp thông báo khi mới tải trang
    if (errorBox) errorBox.style.display = "none";
    if (successBox) successBox.style.display = "none";

    function showError(msg) {
        if (!errorBox) return;
        errorBox.textContent = msg;
        errorBox.style.display = "block";
        if (successBox) successBox.style.display = "none";
    }

    function showSuccess(msg) {
        if (!successBox) return;
        successBox.textContent = msg;
        successBox.style.display = "block";
        if (errorBox) errorBox.style.display = "none";
    }

    // ================= STEP 1: XÁC MINH TÀI KHOẢN =================
    if (step1) {
        step1.addEventListener("submit", function (e) {
            e.preventDefault();

            const value = document.getElementById("identify").value.trim().toLowerCase();

            if (value === "") {
                showError("Vui lòng nhập Email hoặc Số điện thoại.");
                return;
            }

            // Chống tình trạng nhấn gửi liên tiếp khi đang xử lý
            const submitBtn = step1.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            showSuccess("Đang xác thực tài khoản trên hệ thống...");

            // Đọc dữ liệu từ Firebase Realtime Database
            window.database.ref("users").once("value")
                .then((snapshot) => {
                    if (submitBtn) submitBtn.disabled = false;
                    const usersData = snapshot.val() || {};

                    // Tìm Key của user có email hoặc số điện thoại trùng khớp
                    foundUserFirebaseKey = Object.keys(usersData).find(key => {
                        const u = usersData[key];
                        const emailMatch = u.email && u.email.toLowerCase() === value;
                        const phoneMatch = u.phone && u.phone.toLowerCase() === value;
                        return emailMatch || phoneMatch;
                    });

                    if (!foundUserFirebaseKey) {
                        showError("Không tìm thấy tài khoản với thông tin này.");
                        return;
                    }

                    // Tài khoản hợp lệ -> Chuyển sang Bước 2
                    step1.style.display = "none";
                    if (step2) step2.style.display = "block";
                    showSuccess("Xác thực thành công! Vui lòng nhập mật khẩu mới.");
                })
                .catch((error) => {
                    if (submitBtn) submitBtn.disabled = false;
                    showError("Lỗi kết nối hệ thống: " + error.message);
                });
        });
    }

    // ================= STEP 2: CẬP NHẬT MẬT KHẨU MỚI =================
    if (step2) {
        step2.addEventListener("submit", function (e) {
            e.preventDefault();

            const newPass = document.getElementById("newPass").value.trim();
            const confirm = document.getElementById("confirmPass").value.trim();

            if (newPass === "") {
                showError("Vui lòng nhập mật khẩu mới.");
                return;
            }

            if (confirm === "") {
                showError("Vui lòng nhập lại mật khẩu.");
                return;
            }

            if (newPass.length < 6) {
                showError("Mật khẩu phải từ 6 ký tự trở lên để đảm bảo an toàn.");
                return;
            }

            if (newPass !== confirm) {
                showError("Mật khẩu nhập lại không trùng khớp.");
                return;
            }

            if (!foundUserFirebaseKey) {
                showError("Đã xảy ra lỗi hệ thống (Thiếu mã định danh). Vui lòng tải lại trang.");
                return;
            }

            const submitBtnStep2 = step2.querySelector("button[type='submit']");
            if (submitBtnStep2) submitBtnStep2.disabled = true;

            showSuccess("Đang tiến hành cập nhật mật khẩu...");

            // Cập nhật trường password của User này trên Firebase
            window.database.ref("users/" + foundUserFirebaseKey).update({
                password: newPass
            })
            .then(() => {
                showSuccess("Đổi mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...");
                
                setTimeout(function () {
                    window.location.href = "dangnhap.html";
                }, 2000);
            })
            .catch((error) => {
                if (submitBtnStep2) submitBtnStep2.disabled = false;
                showError("Lỗi không thể lưu mật khẩu mới: " + error.message);
            });
        });
    }
});