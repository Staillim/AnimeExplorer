// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "anime-explorer-i5zxq",
  "appId": "1:359869602547:web:d51fb0370a686421177586",
  "storageBucket": "anime-explorer-i5zxq.firebasestorage.app",
  "apiKey": "AIzaSyB-UrnJ5XQYnCbWC0H2lr9DVV_E119AQcs",
  "authDomain": "anime-explorer-i5zxq.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "359869602547"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);


export { app, auth, db };
