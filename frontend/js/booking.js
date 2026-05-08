/* Booking logic for doctor profile page */

import { listDoctors, getDoctorAvailability, bookAppointment, getMe } from "./api.js";

const doctorSelect = document.getElementById("doctorSelect");
const availabilityList = document.getElementById("availabilityList");
const bookingForm = document.getElementById("bookingForm");
const statusBox = document.getElementById("bookingStatus");
const selectedSlot = document.getElementById("selectedSlot");

function showStatus(text, type = "alert") {
  if (!statusBox) return;
  statusBox.textContent = text;
  statusBox.className = type;
}

function renderSlot(slot) {
  const li = document.createElement("li");
  const label = formatSlotLabel(slot.datetime);
  li.innerHTML = `
    <label>
      <input type="radio" name="slot" value="${slot.datetime}" ${slot.available ? "" : "disabled"} />
      ${label} ${slot.available ? "" : "(booked)"}
    </label>
  `;
  return li;
}

function formatSlotLabel(value) {
  return new Date(value).toLocaleString();
}

function showSelectedSlot(value) {
  if (!selectedSlot) return;
  if (!value) {
    selectedSlot.textContent = "No slot selected";
    return;
  }
  selectedSlot.textContent = `Selected: ${formatSlotLabel(value)}`;
}

async function loadDoctors() {
  const doctors = await listDoctors();
  if (!doctorSelect) return;
  doctorSelect.innerHTML = "";
  doctors.forEach((doc) => {
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = `${doc.full_name} (${doc.specialization || "General"})`;
    doctorSelect.appendChild(option);
  });
}

async function loadAvailability() {
  if (!doctorSelect) return;
  const doctorId = doctorSelect.value;
  availabilityList.innerHTML = "";
  showStatus("Loading availability...");
  try {
    const slots = await getDoctorAvailability(doctorId);
    slots.forEach((slot) => availabilityList.appendChild(renderSlot(slot)));
    showStatus("Pick a time and complete booking.", "success");
    showSelectedSlot("");
  } catch (err) {
    showStatus(err.message || "Failed to load availability");
  }
}

async function handleBooking(event) {
  event.preventDefault();
  try {
    await getMe();
  } catch (err) {
    window.location.href = "login.html";
    return;
  }

  const doctorId = parseInt(doctorSelect.value, 10);
  const slot = document.querySelector("input[name='slot']:checked");
  if (!slot) {
    showStatus("Please select a time slot.");
    return;
  }
  const reason = bookingForm.reason.value.trim();
  showStatus("Booking appointment...");
  try {
    await bookAppointment({
      doctor_id: doctorId,
      scheduled_at: slot.value,
      reason,
    });
    showStatus("Appointment booked successfully.", "success");
    bookingForm.reset();
    await loadAvailability();
  } catch (err) {
    showStatus(err.message || "Booking failed");
  }
}

if (doctorSelect) {
  doctorSelect.addEventListener("change", loadAvailability);
}

if (bookingForm) {
  bookingForm.addEventListener("submit", handleBooking);
}

if (availabilityList) {
  availabilityList.addEventListener("change", (event) => {
    const input = event.target.closest("input[name='slot']");
    if (input) {
      showSelectedSlot(input.value);
    }
  });
}

loadDoctors().then(loadAvailability);
