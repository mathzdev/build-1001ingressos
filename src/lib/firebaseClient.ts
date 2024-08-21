import sanitizedEnv from '@/config/env';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: sanitizedEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: sanitizedEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: sanitizedEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: sanitizedEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: sanitizedEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: sanitizedEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const storage = getStorage(app);
