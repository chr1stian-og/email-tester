import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBe8fOKbyEMK3xd0qMWMSYIAzV89iplYbI",
  authDomain: "clubnet-email-tester.firebaseapp.com",
  projectId: "clubnet-email-tester",
  storageBucket: "clubnet-email-tester.appspot.com",
  messagingSenderId: "338443058534",
  appId: "1:338443058534:web:c039b43be73da09ddc5ca7",
};

const app_auth = initializeApp(firebaseConfig);
const app_db = initializeApp(firebaseConfig);

export const auth = getAuth(app_auth);
export const db = getFirestore(app_db);
