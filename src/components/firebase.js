import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "clubnet-email-tester.firebaseapp.com",
  projectId: "clubnet-email-tester",
  storageBucket: "clubnet-email-tester.appspot.com",
  messagingSenderId: "338443058534",
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app_auth = initializeApp(firebaseConfig);
const app_db = initializeApp(firebaseConfig);

export const auth = getAuth(app_auth);
export const db = getFirestore(app_db);
