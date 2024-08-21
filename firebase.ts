// Import the functions you need from the SDKs you need
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    query,
    where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyCDAntp15-90Q8w5eWmcc8em6TCHEx2KWU',
    authDomain: 'ticketking-963c6.firebaseapp.com',
    projectId: 'ticketking-963c6',
    storageBucket: 'ticketking-963c6.appspot.com',
    messagingSenderId: '563126681099',
    appId: '1:563126681099:web:065f2835bf844881a4110e',
};

// Initialize Firebase
// const firebase = initializeApp(firebaseConfig);

export {
    addDoc,
    collection,
    doc,
    getDoc,
    getDownloadURL,
    query,
    ref,
    signInWithEmailAndPassword,
    signOut,
    uploadBytesResumable,
    where,
};
