import { requireUser } from "./auth.js";
import {
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "./firebase.js";

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileStartDate = document.getElementById("profileStartDate");
const profileSolved = document.getElementById("profileSolved");
const resetBtn = document.getElementById("resetTrackerBtn");

async function clearCollection(path) {
  const snap = await getDocs(collection(db, path));
  await Promise.all(snap.docs.map((item) => deleteDoc(item.ref)));
}

async function initProfile() {
  if (!db || !profileName) return;
  const user = await requireUser();
  if (!user) return;

  const summaryRef = doc(db, `users/${user.uid}/meta/summary`);
  const summarySnap = await getDoc(summaryRef);
  const summary = summarySnap.exists() ? summarySnap.data() : {};
  profileName.textContent = summary.name || user.displayName || "Mission User";
  profileEmail.textContent = summary.email || user.email || "-";
  profileStartDate.textContent = summary.startDate
    ? new Date(summary.startDate).toLocaleDateString()
    : "-";

  const progressSnap = await getDocs(collection(db, `users/${user.uid}/progress`));
  let solved = 0;
  progressSnap.forEach((item) => {
    if (item.data().solved) solved += 1;
  });
  profileSolved.textContent = String(solved);

  resetBtn.addEventListener("click", async () => {
    const confirmed = window.confirm(
      "Reset all mission progress and calendar schedule?"
    );
    if (!confirmed) return;
    await clearCollection(`users/${user.uid}/progress`);
    await clearCollection(`users/${user.uid}/customSchedule`);
    await setDoc(
      summaryRef,
      {
        startDate: new Date().toISOString(),
        name: profileName.textContent,
        email: profileEmail.textContent,
        resetAt: serverTimestamp(),
      },
      { merge: true }
    );
    profileSolved.textContent = "0";
  });
}

initProfile();
