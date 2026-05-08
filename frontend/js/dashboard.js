/* Patient dashboard logic */

import { getMe, listAppointments, cancelAppointment, rescheduleAppointment } from "./api.js";

const userName = document.getElementById("userName");
const appointmentsTable = document.getElementById("appointmentsTable");
const emptyState = document.getElementById("emptyState");
const statusBox = document.getElementById("statusBox");

function showStatus(text, type = "alert") {
  if (!statusBox) return;
  statusBox.textContent = text;
  statusBox.className = type;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString();
}

function isSoon(value) {
  const date = new Date(value);
  const hours = (date.getTime() - Date.now()) / 36e5;
  return hours >= 0 && hours <= 48;
}

function renderRow(appt) {
  const tr = document.createElement("tr");
  const when = formatDateTime(appt.scheduled_at);
  const badgeClass = isSoon(appt.scheduled_at) ? "badge" : "badge";
  tr.innerHTML = `
    <td>${appt.id}</td>
    <td>${when}</td>
    <td><span class="${badgeClass}">${appt.status}</span></td>
    <td>${appt.doctor_id}</td>
    <td>
      <button data-action="cancel" data-id="${appt.id}">Cancel</button>
      <button data-action="reschedule" data-id="${appt.id}">Reschedule</button>
    </td>
  `;
  return tr;
}

async function loadUser() {
  try {
    const user = await getMe();
    if (userName) userName.textContent = user.full_name;
  } catch (err) {
    window.location.href = "login.html";
  }
}

async function loadAppointments() {
  showStatus("Loading appointments...");
  try {
    const items = await listAppointments();
    items.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    if (!appointmentsTable) return;
    appointmentsTable.innerHTML = "";
    if (items.length === 0 && emptyState) {
      emptyState.classList.remove("hidden");
    } else if (emptyState) {
      emptyState.classList.add("hidden");
    }
    items.forEach((appt) => {
      appointmentsTable.appendChild(renderRow(appt));
    });
    showStatus("Appointments loaded.", "success");
  } catch (err) {
    showStatus(err.message || "Failed to load appointments");
  }
}

async function handleTableClick(event) {
  const btn = event.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "cancel") {
    const reason = prompt("Cancellation reason (optional):") || "";
    try {
      await cancelAppointment(id, reason);
      showStatus("Appointment canceled.", "success");
      await loadAppointments();
    } catch (err) {
      showStatus(err.message || "Cancel failed");
    }
  }

  if (btn.dataset.action === "reschedule") {
    const input = prompt("New time (YYYY-MM-DDTHH:MM):");
    if (!input) return;
    try {
      await rescheduleAppointment(id, input);
      showStatus("Appointment rescheduled.", "success");
      await loadAppointments();
    } catch (err) {
      showStatus(err.message || "Reschedule failed");
    }
  }
}

if (appointmentsTable) {
  appointmentsTable.addEventListener("click", handleTableClick);
}

loadUser();
loadAppointments();
