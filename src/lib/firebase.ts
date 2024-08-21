import sanitizedEnv from '@/config/env';
import { initFirestore } from '@auth/firebase-adapter';
import { cert } from 'firebase-admin/app';
import { initializeApp } from 'firebase/app';

const credential = cert({
    projectId: sanitizedEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: sanitizedEnv.FIREBASE_CLIENT_EMAIL,
    privateKey: sanitizedEnv.FIREBASE_PRIVATE_KEY,
});

export const firestoreAdmin = initFirestore({
    credential,
});

const firebaseConfig = {
    apiKey: sanitizedEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: sanitizedEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: sanitizedEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: sanitizedEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: sanitizedEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: sanitizedEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
