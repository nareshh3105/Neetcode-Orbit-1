import { requireUser } from "./auth.js";
import { db, collection, getDocs } from "./firebase.js";
import { getDateKey } from "./app-data.js";

const solvedCount = document.getElementById("solvedCount");
const progressFill = document.getElementById("progressFill");
const currentStreakEl = document.getElementById("currentStreak");
const longestStreakEl = document.getElementById("longestStreak");
const heatmap = document.getElementById("heatmap");

function streakStats(dateKeys) {
  const dates = [...new Set(dateKeys)].sort();
  let longest = 0;
  let current = 0;
  let run = 0;
  let prev = null;
  dates.forEach((dateKey) => {
    const date = new Date(dateKey);
    if (!prev) {
      run = 1;
    } else {
      const diff = Math.round((date - prev) / (1000 * 60 * 60 * 24));
      run = diff === 1 ? run + 1 : 1;
    }
    longest = Math.max(longest, run);
    prev = date;
  });

  const today = new Date(getDateKey());
  const newest = dates.length ? new Date(dates[dates.length - 1]) : null;
  if (newest) {
    const diff = Math.round((today - newest) / (1000 * 60 * 60 * 24));
    current = diff <= 1 ? run : 0;
  }
  return { current, longest };
}

function renderHeatmap(progressByDay) {
  heatmap.innerHTML = "";
  const today = new Date();
  for (let i = 83; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().split("T")[0];
    const solved = progressByDay[key] || 0;
    const cell = document.createElement("span");
    cell.className = "heat-cell";
    if (solved >= 3) cell.classList.add("heat-3");
    else if (solved === 2) cell.classList.add("heat-2");
    else if (solved === 1) cell.classList.add("heat-1");
    cell.title = `${key}: ${solved} solved`;
    heatmap.appendChild(cell);
  }
}

async function initProgress() {
  if (!db || !solvedCount) return;
  const user = await requireUser();
  if (!user) return;
  const snap = await getDocs(collection(db, `users/${user.uid}/progress`));
  let totalSolved = 0;
  const dates = [];
  const progressByDay = {};
  snap.forEach((item) => {
    const data = item.data();
    if (data.solved) {
      totalSolved += 1;
      if (data.dateKey) {
        dates.push(data.dateKey);
        progressByDay[data.dateKey] = (progressByDay[data.dateKey] || 0) + 1;
      }
    }
  });
  const percentage = Math.min((totalSolved / 150) * 100, 100);
  solvedCount.textContent = `${totalSolved} / 150`;
  progressFill.style.width = `${percentage}%`;

  const streak = streakStats(dates);
  currentStreakEl.textContent = `${streak.current} days`;
  longestStreakEl.textContent = `${streak.longest} days`;
  renderHeatmap(progressByDay);
}

initProgress();
