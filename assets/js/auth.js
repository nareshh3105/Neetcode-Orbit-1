import {
  auth,
  db,
  googleProvider,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "./firebase.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const page = document.body.dataset.page;
let cachedUser = undefined;

async function getAuthUser() {
  if (!auth) return null;
  if (cachedUser !== undefined) return cachedUser;
  await setPersistence(auth, browserLocalPersistence);
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      cachedUser = user || null;
      unsubscribe();
      resolve(cachedUser);
    });
  });
}

async function ensureUserDoc(user) {
  if (!db || !user) return;
  const ref = doc(db, `users/${user.uid}/meta/summary`);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    await setDoc(ref, {
      startDate: new Date().toISOString(),
      email: user.email || "",
      name: user.displayName || "Mission User",
      createdAt: serverTimestamp(),
    });
  }
}

function toAuthPage() {
  if (page !== "auth") window.location.href = "./auth.html";
}

function toHomePage() {
  if (page === "auth") window.location.href = "./index.html";
}

export function requireUser() {
  return (async () => {
    if (!auth) {
      toAuthPage();
      return null;
    }
    const user = await getAuthUser();
    if (!user) {
      toAuthPage();
      return null;
    }
    await ensureUserDoc(user);
    window.currentUser = user;
    return user;
  })();
}

function setupAuthPage() {
  const form = document.getElementById("emailAuthForm");
  const msg = document.getElementById("authMessage");
  const googleBtn = document.getElementById("googleSignInBtn");
  if (!form || !msg || !googleBtn || !auth) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      msg.textContent = "Signed in. Redirecting...";
      return;
    } catch (_error) {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        msg.textContent = "Account created. Redirecting...";
      } catch (error) {
        msg.textContent = error.message;
      }
    }
  });

  googleBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      msg.textContent = "Google sign-in successful. Redirecting...";
    } catch (error) {
      msg.textContent = error.message;
    }
  });
}

function setupLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn || !auth) return;
  btn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "./auth.html";
  });
}

if (page === "auth") {
  if (!auth) {
    const msg = document.getElementById("authMessage");
    if (msg) {
      msg.textContent =
        "Firebase config missing. Add assets/js/firebase-config.js first.";
    }
  } else {
    getAuthUser().then((user) => {
      if (user) toHomePage();
    });
  }
  setupAuthPage();
} else if (page) {
  requireUser();
  setupLogout();
}
