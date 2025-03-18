
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc, deleteDoc, updateDoc,
    query, where, getCountFromServer, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
    getDatabase, set, push, onValue, update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyDjdfmmt7VPSv9vxS7260jRSAWNHa_D624",
    authDomain: "garage-5737c.firebaseapp.com",
    projectId: "garage-5737c",
    storageBucket: "garage-5737c.appspot.com",
    messagingSenderId: "521889986895",
    appId: "1:521889986895:web:67275839e35f35a03aed3a",
    measurementId: "G-GCM03SDCPS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const database = getDatabase(app);

export {
    app, db, auth, storage, update, getDoc, deleteDoc, deleteObject,
    getDownloadURL, uploadBytes, signOut, database, set, push, onValue,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier, collection,
    addDoc, getDocs, setDoc, doc, ref, updateDoc, onAuthStateChanged, getAuth,
    query, where, getCountFromServer, orderBy
};