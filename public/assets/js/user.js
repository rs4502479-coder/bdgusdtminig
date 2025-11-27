/* ---------------------------------------------------
   BASIC VALIDATION
--------------------------------------------------- */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Auth Fetch */
async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) return null;

  options.headers = {
    ...(options.headers || {}),
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  };

  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    console.log("authFetch error:", err);
    return null;
  }
}

/* ---------------------------------------------------
   LOAD USER PROFILE (For dashboard)
--------------------------------------------------- */

async function loadUserProfile() {
  try {
    const res = await authFetch("/api/user/me");
    if (!res) return;

    const data = await res.json().catch(() => null);
    if (!data || !data.success) return;

    if (document.getElementById("userName"))
      document.getElementById("userName").innerText = data.user.name;

    if (document.getElementById("userBalance"))
      document.getElementById("userBalance").innerText =
        data.user.balance + " USDT";

    if (document.getElementById("userLevel"))
      document.getElementById("userLevel").innerText = "VIP " + data.user.level;
  } catch (err) {
    console.log("loadProfile error:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("dashboard")) {
    loadUserProfile();
  }
});

/* ---------------------------------------------------
   SIGNUP FUNCTION
--------------------------------------------------- */

async function doSignup() {
  const name = document.getElementById("s_name").value.trim();
  const email = document.getElementById("s_email").value.trim();
  const password = document.getElementById("s_password").value.trim();
  const invite = document.getElementById("s_invite").value.trim();
  const msg = document.getElementById("s_msg");

  if (!name || !email || !password) {
    msg.innerHTML = `<span style="color:red">All fields are required.</span>`;
    return;
  }

  if (!isValidEmail(email)) {
    msg.innerHTML = `<span style="color:red">Invalid email.</span>`;
    return;
  }

  msg.innerHTML = "Please wait...";

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        invite_code: invite || null,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      msg.innerHTML = `<span style="color:red">${data.message}</span>`;
      return;
    }

    localStorage.setItem("token", data.token);

    msg.innerHTML = `<span style="color:green">Account created!</span>`;

    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 700);
  } catch (err) {
    msg.innerHTML = `<span style="color:red">Server error</span>`;
  }
}

/* ---------------------------------------------------
   LOGIN FUNCTION
--------------------------------------------------- */

async function doLogin() {
  const email = document.getElementById("l_email").value.trim();
  const password = document.getElementById("l_password").value.trim();
  const msg = document.getElementById("l_msg");

  if (!email || !password) {
    msg.innerHTML = `<span style="color:red">Enter email & password.</span>`;
    return;
  }

  if (!isValidEmail(email)) {
    msg.innerHTML = `<span style="color:red">Invalid email format.</span>`;
    return;
  }

  msg.innerHTML = "Checking...";

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      msg.innerHTML = `<span style="color:red">${data.message}</span>`;
      return;
    }

    localStorage.setItem("token", data.token);

    msg.innerHTML = `<span style="color:green">Login successful!</span>`;

    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 600);
  } catch (err) {
    msg.innerHTML = `<span style="color:red">Server error</span>`;
  }
}

/* ---------------------------------------------------
   FORM HANDLERS
--------------------------------------------------- */

if (document.getElementById("signupForm")) {
  document
    .getElementById("signupForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      doSignup();
    });
}

if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    doLogin();
  });
}
