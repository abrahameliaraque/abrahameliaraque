// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import{getAuth} from "firebase/auth" ; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlw7S5JHCpH7fmtPKHwgZIKGyzd63wvwg",
  authDomain: "recomendador-de-musica-b8ccf.firebaseapp.com",
  projectId: "recomendador-de-musica-b8ccf",
  storageBucket: "recomendador-de-musica-b8ccf.firebasestorage.app",
  messagingSenderId: "260033409546",
  appId: "1:260033409546:web:b9960ed24d7eea007f65f3",
  measurementId: "G-ER7PNHXQK8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)