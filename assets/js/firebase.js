import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

let firebaseConfig;
try {
  ({ firebaseConfig } = await import("./firebase-config.js"));
} catch (error) {
  console.error(
    "Missing firebase-config.js. Copy firebase-config.example.js to firebase-config.js and fill values."
  );
}

const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const googleProvider = app ? new GoogleAuthProvider() : null;

export {
  app,
  auth,
  db,
  googleProvider,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
};
