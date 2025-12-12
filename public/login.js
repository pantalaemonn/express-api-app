const form = document.getElementById("login-form");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      msg.textContent = data && data.message ? data.message : "Login failed";
      return;
    }
    // success - redirect back to app
    window.location.href = "/app/";
  } catch (err) {
    msg.textContent = "Network error";
  }
});
