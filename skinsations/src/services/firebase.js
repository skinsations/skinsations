import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCram578ndXAZg_0VAnL1thnljCiNzzIE0",
    authDomain: "skinsations-cc05a.firebaseapp.com",
    projectId: "skinsations-cc05a",
    storageBucket: "skinsations-cc05a.firebasestorage.app",
    messagingSenderId: "793899851624",
    appId: "1:793899851624:web:ecbf26e5886f69247440dd",
    measurementId: "G-9582JLTJZS"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
