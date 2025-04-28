// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAO9j8ox-cP5vv__0IzoiLvRJ7VsyqEk4k",
  authDomain: "music-reccomender-e34c3.firebaseapp.com",
  projectId: "music-reccomender-e34c3",
  storageBucket: "music-reccomender-e34c3.firebasestorage.app",
  messagingSenderId: "669636579318",
  appId: "1:669636579318:web:01e340e041f5f97b5e41d7",
  measurementId: "G-HK80XMQH18"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);