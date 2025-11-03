// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHfjLL1EYdtAepSakIdvj9k9ejOnLqVdY",
    authDomain: "plant-care-ab02b.firebaseapp.com",
    projectId: "plant-care-ab02b",
    storageBucket: "plant-care-ab02b.firebasestorage.app",
    messagingSenderId: "538459191919",
    appId: "1:538459191919:web:3ef0d0ab2dbca38f34eb9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;