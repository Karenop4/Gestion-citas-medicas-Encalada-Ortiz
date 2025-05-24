// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyA1wmi6fzzV9erQGUc2nUWGFuzhyCULX8c",
  authDomain: "citamedicas-encalada-ortiz.firebaseapp.com",
  projectId: "citamedicas-encalada-ortiz",
  storageBucket: "citamedicas-encalada-ortiz.firebasestorage.app",
  messagingSenderId: "956103370880",
  appId: "1:956103370880:web:7401b17c3c9191c6019e65",
  measurementId: "G-4VNLG1KHRN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);