document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // Pages that SHOULD NOT be redirected
  const openPages = ["/signup.html", "/login.html", "/index.html"];

  const current = window.location.pathname;

  // If page is open type => do NOT redirect
  if (openPages.some((p) => current.endsWith(p))) {
    return;
  }

  // For protected pages: if no token → send to login
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  // Optional: Validate token with backend
  fetch("/api/user/profile", {
    headers: { Authorization: "Bearer " + token },
  })
    .then((res) => {
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login.html";
      }
    })
    .catch(() => {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
    });
});
