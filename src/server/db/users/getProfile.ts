import { db } from '@/lib/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import { UserData } from './types';

export default async function getProfile(userId: string) {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
        throw new Error('User not found');
    }

    return userSnapshot.data() as UserData;
}
