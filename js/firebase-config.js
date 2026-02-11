// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyAbnXXW3Wyy3wLsjbhHMKC2nu9qe9t3PII",
  authDomain: "project-toko-swalayan.firebaseapp.com",
  projectId: "project-toko-swalayan",
  storageBucket: "project-toko-swalayan.firebasestorage.app",
  messagingSenderId: "64984520514",
  appId: "1:64984520514:web:d0728de7ccad0429c4dadb",
  measurementId: "G-KJM8QYEZPK"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
