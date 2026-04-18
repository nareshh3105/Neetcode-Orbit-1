import { requireUser } from "./auth.js";
import { db, doc, getDoc, setDoc, collection, getDocs } from "./firebase.js";
import {
  weekdays,
  getDateKey,
  readableDate,
  build45DaySchedule,
} from "./app-data.js";

const monthLabel = document.getElementById("monthLabel");
const grid = document.getElementById("calendarGrid");
const weekdaysRow = document.querySelector(".calendar-weekdays");
const modal = document.getElementById("scheduleModal");
const form = document.getElementById("scheduleForm");
const modalDateTitle = document.getElementById("modalDateTitle");
let activeDateKey = null;
let currentDate = new Date();
let userId = null;
let scheduleMap = {};
let progressMap = {};

function renderWeekdays() {
  weekdaysRow.innerHTML = weekdays.map((d) => `<span>${d}</span>`).join("");
}

function statusClass(dateKey) {
  const dayProgress = progressMap[dateKey] || 0;
  if (dayProgress >= 3) return "day-complete";
  if (dayProgress > 0) return "day-partial";
  const date = new Date(dateKey);
  if (date < new Date(getDateKey())) return "day-missed";
  return "";
}

function openEditor(dateKey) {
  activeDateKey = dateKey;
  modalDateTitle.textContent = `Edit ${readableDate(dateKey)}`;
  const existing = scheduleMap[dateKey] || {};
  form.q1Title.value = existing.q1Title || "";
  form.q1Link.value = existing.q1Link || "";
  form.q2Title.value = existing.q2Title || "";
  form.q2Link.value = existing.q2Link || "";
  form.q3Title.value = existing.q3Title || "";
  form.q3Link.value = existing.q3Link || "";
  modal.showModal();
}

function renderCalendar() {
  monthLabel.textContent = currentDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });
  grid.innerHTML = "";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i += 1) {
    const filler = document.createElement("span");
    filler.className = "calendar-filler";
    grid.appendChild(filler);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = date.toISOString().split("T")[0];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `calendar-day ${statusClass(dateKey)}`;
    button.innerHTML = `<strong>${day}</strong><small>${scheduleMap[dateKey] ? "Planned" : "Open"}</small>`;
    button.addEventListener("click", () => openEditor(dateKey));
    grid.appendChild(button);
  }
}

async function loadData() {
  scheduleMap = {};
  progressMap = {};
  const [scheduleSnap, progressSnap] = await Promise.all([
    getDocs(collection(db, `users/${userId}/customSchedule`)),
    getDocs(collection(db, `users/${userId}/progress`)),
  ]);
  scheduleSnap.forEach((item) => {
    scheduleMap[item.id] = item.data();
  });
  progressSnap.forEach((item) => {
    const data = item.data();
    if (data.solved && data.dateKey) {
      progressMap[data.dateKey] = (progressMap[data.dateKey] || 0) + 1;
    }
  });
}

async function seedFromPdfPlanIfEmpty() {
  if (Object.keys(scheduleMap).length > 0) return;
  const seededSchedule = build45DaySchedule(getDateKey());
  await Promise.all(
    Object.entries(seededSchedule).map(([dateKey, schedule]) =>
      setDoc(doc(db, `users/${userId}/customSchedule/${dateKey}`), schedule)
    )
  );
  scheduleMap = seededSchedule;
}

async function initCalendar() {
  if (!grid || !db) return;
  const user = await requireUser();
  if (!user) return;
  userId = user.uid;
  renderWeekdays();
  await loadData();
  await seedFromPdfPlanIfEmpty();
  renderCalendar();
}

document.getElementById("prevMonthBtn").addEventListener("click", () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  renderCalendar();
});

document.getElementById("nextMonthBtn").addEventListener("click", () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  renderCalendar();
});

document.getElementById("closeModalBtn").addEventListener("click", () => modal.close());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeDateKey) return;
  const ref = doc(db, `users/${userId}/customSchedule/${activeDateKey}`);
  await setDoc(ref, {
    q1Title: form.q1Title.value.trim(),
    q1Link: form.q1Link.value.trim(),
    q2Title: form.q2Title.value.trim(),
    q2Link: form.q2Link.value.trim(),
    q3Title: form.q3Title.value.trim(),
    q3Link: form.q3Link.value.trim(),
  });
  const saved = await getDoc(ref);
  scheduleMap[activeDateKey] = saved.data();
  modal.close();
  renderCalendar();
});

initCalendar();
