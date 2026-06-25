document.addEventListener("DOMContentLoaded", function () {

    const userBox = document.getElementById("userBox");
    const isLogin = localStorage.getItem("isLogin");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (isLogin === "true" && currentUser) {

        const firstName = currentUser.fullName.trim().split(" ").pop();

        userBox.innerHTML = `
            <div class="user-info">
                <span>${firstName}</span>
                <button id="logoutBtn">Đăng xuất</button>
            </div>
        `;

        document.getElementById("logoutBtn").addEventListener("click", function () {

            localStorage.removeItem("isLogin");
            localStorage.removeItem("currentUser");

            window.location.href = "dangnhap.html";

        });

    } else {

        userBox.innerHTML = `
            <a href="dangnhap.html">Đăng nhập</a>
        `;

    }
    const bang2 = document.getElementById("bang2");
    const dong = document.querySelector(".dong");

    if (dong) {
        dong.onclick = function () {
            bang2.style.display = "none";
        };
    }

    window.onclick = function (e) {
        if (e.target === bang2) {
            bang2.style.display = "none";
        }
    };

});

function lienHe() {

    const isLogin = localStorage.getItem("isLogin");

    if (isLogin !== "true") {

        alert("Vui lòng đăng nhập để liên hệ với shop!");
        window.location.href = "dangnhap.html";
        return;

    }

    document.getElementById("bang2").style.display = "flex";

}
document.addEventListener("DOMContentLoaded", function () {

    const id =
        Number(localStorage.getItem("selectedProductId"));

    const products =
        JSON.parse(localStorage.getItem("products")) || [];

    const product =
        products.find(p => p.id == id);

    if (!product) return;

    document.getElementById("anhXe").src =
        product.image;

    document.getElementById("tenXe").innerText =
        product.name;

    document.getElementById("giaXe").innerText =
        Number(product.price).toLocaleString() + " VNĐ";

    document.getElementById("hangXe").innerText =
        product.category;

    document.getElementById("year").innerText =
        product.year || "Chưa cập nhật";

    document.getElementById("engine").innerText =
        product.engine || "Chưa cập nhật";

    document.getElementById("power").innerText =
        product.power || "Chưa cập nhật";

    document.getElementById("gearbox").innerText =
        product.gearbox || "Chưa cập nhật";

    document.getElementById("drive").innerText =
        product.drive || "Chưa cập nhật";

    document.getElementById("acceleration").innerText =
        product.acceleration || "Chưa cập nhật";

    document.getElementById("topspeed").innerText =
        product.topspeed || "Chưa cập nhật";

    document.getElementById("description").innerText =
        product.description || "Chưa có mô tả";

});
