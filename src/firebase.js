import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDucNO4bIAFGVzQC7746jpd1KhPnCsvN_M",
  authDomain: "social-media-app-e3d8c.firebaseapp.com",
  projectId: "social-media-app-e3d8c",
  storageBucket: "social-media-app-e3d8c.appspot.com",
  messagingSenderId: "893253809901",
  appId: "1:893253809901:web:18c54adb45661bc5717ee4",
  measurementId: "G-85VG1HK54E"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export const storage = getStorage();
export const db = getFirestore(app);
