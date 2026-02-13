// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyD54wiu5paooS6oXiRuSmpxRkE7pB0oTTg",
  authDomain: "project-toko-swalayan-4e0e6.firebaseapp.com",
  projectId: "project-toko-swalayan-4e0e6",
  storageBucket: "project-toko-swalayan-4e0e6.firebasestorage.app",
  messagingSenderId: "27549660617",
  appId: "1:27549660617:web:16e556b93fca7eef13e418"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
