/* Authentication page logic for MediBook */

import { login, register, clearToken, getMe } from "./api.js";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const messageBox = document.getElementById("authMessage");
const logoutBtn = document.getElementById("logoutBtn");
const roleSelect = registerForm ? registerForm.querySelector("select[name='role']") : null;
const specializationInput = registerForm ? registerForm.querySelector("input[name='specialization']") : null;
const bioInput = registerForm ? registerForm.querySelector("textarea[name='bio']") : null;

function showMessage(text, type = "alert") {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.className = type;
}

function toggleDoctorFields() {
  if (!roleSelect || !specializationInput || !bioInput) return;
  const isDoctor = roleSelect.value === "doctor";
  specializationInput.disabled = !isDoctor;
  bioInput.disabled = !isDoctor;
  if (!isDoctor) {
    specializationInput.value = "";
    bioInput.value = "";
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = event.target.email.value.trim();
  const password = event.target.password.value.trim();
  showMessage("Signing in...");
  try {
    const user = await login({ email, password });
    showMessage(`Welcome back, ${user.full_name}!`, "success");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 700);
  } catch (err) {
    showMessage(err.message || "Login failed");
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const form = event.target;
  const payload = {
    full_name: form.full_name.value.trim(),
    email: form.email.value.trim(),
    password: form.password.value.trim(),
    role: form.role.value,
    specialization: form.specialization.value.trim() || null,
    bio: form.bio.value.trim() || null,
  };
  showMessage("Creating account...");
  try {
    const user = await register(payload);
    showMessage(`Welcome, ${user.full_name}!`, "success");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 700);
  } catch (err) {
    showMessage(err.message || "Registration failed");
  }
}

async function handleLogout() {
  clearToken();
  showMessage("You are logged out.", "success");
}

async function hydrateUser() {
  if (!logoutBtn) return;
  try {
    await getMe();
    logoutBtn.classList.remove("hidden");
  } catch (err) {
    logoutBtn.classList.add("hidden");
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

if (registerForm) {
  registerForm.addEventListener("submit", handleRegister);
}

if (roleSelect) {
  roleSelect.addEventListener("change", toggleDoctorFields);
  toggleDoctorFields();
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
}

hydrateUser();
