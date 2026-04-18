import { requireUser } from "./auth.js";
import { db, doc, getDoc, setDoc, serverTimestamp } from "./firebase.js";
import { defaultDailyQuestions, getDateKey } from "./app-data.js";

const wrapper = document.getElementById("todayQuestions");

function difficultyClass(level) {
  if (level === "Easy") return "badge-easy";
  if (level === "Hard") return "badge-hard";
  return "badge-medium";
}

async function solvedMapForDate(uid, dateKey, questions) {
  const entries = await Promise.all(
    questions.map(async (question) => {
      const ref = doc(db, `users/${uid}/progress/${dateKey}_${question.id}`);
      const snap = await getDoc(ref);
      return [question.id, snap.exists() ? Boolean(snap.data().solved) : false];
    })
  );
  return Object.fromEntries(entries);
}

async function saveSolved(uid, dateKey, questionId, solved) {
  const ref = doc(db, `users/${uid}/progress/${dateKey}_${questionId}`);
  await setDoc(
    ref,
    {
      solved,
      dateKey,
      questionId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

async function questionsForDate(uid, dateKey) {
  const scheduleRef = doc(db, `users/${uid}/customSchedule/${dateKey}`);
  const schedule = await getDoc(scheduleRef);
  if (!schedule.exists()) return defaultDailyQuestions;
  const data = schedule.data();
  return [
    { id: "q1", title: data.q1Title, link: data.q1Link || "#", difficulty: "Custom" },
    { id: "q2", title: data.q2Title, link: data.q2Link || "#", difficulty: "Custom" },
    { id: "q3", title: data.q3Title, link: data.q3Link || "#", difficulty: "Custom" },
  ];
}

function renderQuestions(uid, dateKey, solvedMap, questions) {
  wrapper.innerHTML = "";
  questions.forEach((question) => {
    const solved = Boolean(solvedMap[question.id]);
    const card = document.createElement("article");
    card.className = `glass-panel question-card ${solved ? "is-solved" : ""}`;
    card.innerHTML = `
      <div class="question-head">
        <h2>${question.title}</h2>
        <span class="difficulty-badge ${difficultyClass(question.difficulty)}">${question.difficulty}</span>
      </div>
      <div class="hero-actions">
        <a class="secondary-btn" href="${question.link}" target="_blank" rel="noreferrer">Open Problem</a>
        <label class="toggle-wrap">
          <input type="checkbox" ${solved ? "checked" : ""} />
          <span>Mark Solved</span>
        </label>
      </div>
    `;
    card.querySelector("input").addEventListener("change", async (event) => {
      const value = event.target.checked;
      await saveSolved(uid, dateKey, question.id, value);
      card.classList.toggle("is-solved", value);
    });
    wrapper.appendChild(card);
  });
}

async function initToday() {
  if (!wrapper || !db) return;
  const user = await requireUser();
  if (!user) return;
  const dateKey = getDateKey();
  const questions = await questionsForDate(user.uid, dateKey);
  const solvedMap = await solvedMapForDate(user.uid, dateKey, questions);
  renderQuestions(user.uid, dateKey, solvedMap, questions);
}

initToday();
