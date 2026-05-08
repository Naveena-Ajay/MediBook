/* API helper functions for MediBook */

const API_BASE = "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("medibook_token");
}

function setToken(token) {
  localStorage.setItem("medibook_token", token);
}

function clearToken() {
  localStorage.removeItem("medibook_token");
}

async function request(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch (err) {
      message = `${response.status} ${response.statusText}`;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

async function login(payload) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setToken(data.access_token);
  return data.user;
}

async function register(payload) {
  const data = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setToken(data.access_token);
  return data.user;
}

async function getMe() {
  const data = await request("/api/auth/me");
  return data.user;
}

async function listDoctors(specialization = "") {
  const query = specialization ? `?specialization=${encodeURIComponent(specialization)}` : "";
  return request(`/api/doctors${query}`);
}

async function getDoctorAvailability(doctorId) {
  return request(`/api/doctors/${doctorId}/availability`);
}

async function bookAppointment(payload) {
  return request("/api/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function listAppointments() {
  const data = await request("/api/appointments");
  return data.items || [];
}

async function cancelAppointment(id, reason = "") {
  return request(`/api/appointments/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

async function rescheduleAppointment(id, scheduled_at) {
  return request(`/api/appointments/${id}/reschedule`, {
    method: "POST",
    body: JSON.stringify({ scheduled_at }),
  });
}

async function createPrescription(payload) {
  return request("/api/prescriptions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function getPrescriptions(appointmentId) {
  const data = await request(`/api/prescriptions/${appointmentId}`);
  return data.items || [];
}

export {
  API_BASE,
  getToken,
  setToken,
  clearToken,
  login,
  register,
  getMe,
  listDoctors,
  getDoctorAvailability,
  bookAppointment,
  listAppointments,
  cancelAppointment,
  rescheduleAppointment,
  createPrescription,
  getPrescriptions,
};
