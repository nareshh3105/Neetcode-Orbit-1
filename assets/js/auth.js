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

let authMode = "signin";

function setupAuthPage() {
  const form = document.getElementById("emailAuthForm");
  const msg = document.getElementById("authMessage");
  const googleBtn = document.getElementById("googleSignInBtn");
  
  const submitBtn = document.getElementById("authSubmitBtn");
  const toggleModeBtn = document.getElementById("toggleAuthModeBtn");
  const togglePwdBtn = document.getElementById("togglePasswordBtn");
  const pwdInput = document.getElementById("passwordInput");
  const authSubtitle = document.getElementById("authSubtitle");

  if (!form || !msg || !googleBtn || !auth) return;

  if (togglePwdBtn && pwdInput) {
    togglePwdBtn.addEventListener("click", () => {
      const isPassword = pwdInput.type === "password";
      pwdInput.type = isPassword ? "text" : "password";
      togglePwdBtn.textContent = isPassword ? "Hide" : "Show";
    });
  }

  if (toggleModeBtn && submitBtn && pwdInput && authSubtitle) {
    toggleModeBtn.addEventListener("click", () => {
      if (authMode === "signin") {
        authMode = "signup";
        submitBtn.textContent = "Sign Up";
        toggleModeBtn.textContent = "Already have an account? Sign In";
        authSubtitle.textContent = "Create an account to start your trajectory.";
        pwdInput.setAttribute("autocomplete", "new-password");
      } else {
        authMode = "signin";
        submitBtn.textContent = "Sign In";
        toggleModeBtn.textContent = "Don't have an account? Sign Up";
        authSubtitle.textContent = "Sign in to continue your coding trajectory.";
        pwdInput.setAttribute("autocomplete", "current-password");
      }
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("emailInput").value.trim();
    const password = pwdInput.value.trim();
    
    msg.textContent = authMode === "signin" ? "Signing in..." : "Creating account...";

    if (authMode === "signin") {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        msg.textContent = "Signed in. Redirecting...";
        toHomePage();
      } catch (error) {
        msg.textContent = error.message;
      }
    } else {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        msg.textContent = "Account created. Redirecting...";
        toHomePage();
      } catch (error) {
        msg.textContent = error.message;
      }
    }
  });

  googleBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      msg.textContent = "Google sign-in successful. Redirecting...";
      toHomePage();
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
} else if (page === "home") {
  setupLogout();
} else if (page) {
  requireUser();
  setupLogout();
}
