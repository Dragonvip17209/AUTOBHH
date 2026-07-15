// JavaScript Document

const KEY_USERS = "users";
let foundUserIndex = -1;

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(KEY_USERS)) || [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
}

document.addEventListener("DOMContentLoaded", function () {

    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const errorBox = document.getElementById("errorBox");
    const successBox = document.getElementById("successBox");

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.style.display = "block";
        successBox.style.display = "none";
    }

    function showSuccess(msg) {
        successBox.textContent = msg;
        successBox.style.display = "block";
        errorBox.style.display = "none";
    }

    // STEP 1
    step1.addEventListener("submit", function (e) {

        e.preventDefault();

        const value = document
            .getElementById("identify")
            .value
            .trim()
            .toLowerCase();

        if (value === "") {
            showError("Vui lòng nhập Email hoặc Số điện thoại.");
            return;
        }

        const users = getUsers();

        foundUserIndex = users.findIndex(function (u) {

            return (
                (u.email && u.email.toLowerCase() === value) ||
                (u.phone && u.phone.toLowerCase() === value)
            );

        });

        if (foundUserIndex === -1) {
            showError("Không tìm thấy tài khoản với thông tin này.");
            return;
        }

        step1.style.display = "none";
        step2.style.display = "block";

        showSuccess("Tài khoản hợp lệ. Vui lòng nhập mật khẩu mới.");

    });

    // STEP 2
    step2.addEventListener("submit", function (e) {

        e.preventDefault();

        const newPass =
            document.getElementById("newPass").value.trim();

        const confirm =
            document.getElementById("confirmPass").value.trim();

        if (newPass === "") {
            showError("Vui lòng nhập mật khẩu mới.");
            return;
        }

        if (confirm === "") {
            showError("Vui lòng nhập lại mật khẩu.");
            return;
        }

        if (newPass.length < 6) {
            showError("Mật khẩu phải từ 6 ký tự trở lên.");
            return;
        }

        if (newPass !== confirm) {
            showError("Mật khẩu nhập lại không khớp.");
            return;
        }

        const users = getUsers();

        users[foundUserIndex].password = newPass;

        saveUsers(users);

        showSuccess(
            "Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập..."
        );

        setTimeout(function () {
            window.location.href = "dangnhap.html";
        }, 1500);

    });

});