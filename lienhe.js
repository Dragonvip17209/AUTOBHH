document.addEventListener("DOMContentLoaded", function () {

  // Public Key
  emailjs.init("SX-6_0UJ1L9qpp4Bk");

  // Form
  const form = document.getElementById("contactForm");
form.addEventListener("submit", function (e) {

    e.preventDefault();

    const isLogin = localStorage.getItem("isLogin");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (isLogin !== "true" || !currentUser) {
        alert("Vui lòng đăng nhập để gửi liên hệ!");
        window.location.href = "dangnhap.html";
        return;
    }
    // Lấy dữ liệu
    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // Kiểm tra rỗng
    if (!fullName || !phone || !message) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Dữ liệu gửi
    const templateParams = {

      name: fullName,
      from_name: fullName,

      phone: phone,
      email: email,
      message: message
    };

    // Gửi mail
    emailjs.send(
      "DragonShadow",
      "template_hjevrqb",
      templateParams
    )

    .then(function (response) {

      alert("Gửi liên hệ thành công!");
      console.log("SUCCESS!", response.status, response.text);

      form.reset();

    })

    .catch(function (error) {

      alert("Gửi thất bại!");
      console.log("FAILED...", error);

    });

  });

});
document.addEventListener("DOMContentLoaded", function () {

  const userMenu = document.getElementById("userMenu");

  // lấy trạng thái đăng nhập
  const isLogin = localStorage.getItem("isLogin");

  // lấy user hiện tại
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // nếu đã đăng nhập
  if (isLogin === "true" && currentUser) {

    userMenu.innerHTML = `
      <a href="#" id="userName">
        ${currentUser.fullName}
      </a>

      <ul class="menu2">
        <li><a href="#" id="logoutBtn">Đăng xuất</a></li>
      </ul>
    `;

    // xử lý đăng xuất
    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn.addEventListener("click", function () {

      localStorage.removeItem("isLogin");

      localStorage.removeItem("currentUser");

      alert("Đăng xuất thành công!");

      window.location.reload();
    });
  }

});
document.addEventListener("DOMContentLoaded", function () {

  const userMenu = document.getElementById("userMenu");

  // lấy trạng thái đăng nhập
  const isLogin = localStorage.getItem("isLogin");

  // lấy user hiện tại
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // nếu đã đăng nhập
  if (isLogin === "true" && currentUser) {

    // Lấy tên
    const firstName = currentUser.fullName.trim().split(" ").pop();

    userMenu.innerHTML = `
      <a href="#" id="userName">
        ${firstName}
      </a>

      <ul class="menu2">
        <li><a href="#" id="logoutBtn">Đăng xuất</a></li>
      </ul>
    `;

    // xử lý đăng xuất
    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn.addEventListener("click", function () {

      localStorage.removeItem("isLogin");
      localStorage.removeItem("currentUser");

      alert("Đăng xuất thành công!");

      window.location.reload();
    });
  }

});

document.addEventListener("DOMContentLoaded", function () {

  const userBox = document.getElementById("userBox");

  // lấy trạng thái đăng nhập
  const isLogin = localStorage.getItem("isLogin");

  // lấy user hiện tại
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // nếu đã đăng nhập
  if (isLogin === "true" && currentUser) {

    // Lấy tên
    const firstName = currentUser.fullName.trim().split(" ").pop();

    userBox.innerHTML = `
      <div class="user-info">
        <span>${firstName}</span>
        <button id="logoutBtn">Đăng xuất</button>
      </div>
    `;

    // xử lý đăng xuất
    document.getElementById("logoutBtn").addEventListener("click", function () {

      localStorage.removeItem("isLogin");
      localStorage.removeItem("currentUser");

      window.location.href = "dangnhap.html";
    });

  } else {

    // chưa đăng nhập
    userBox.innerHTML = `
      <a href="dangnhap.html">Đăng nhập</a>
    `;
  }

});