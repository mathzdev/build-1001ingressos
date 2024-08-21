import { db } from '@/lib/firebaseClient';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserData } from './types';

export default async function updateProfile(
    userId: string,
    data: Partial<UserData>
) {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
        throw new Error('User not found');
    }

    const updateData: any = {};
    for (const key in data) {
        const value = data[key as keyof UserData];
        if (value !== undefined) {
            updateData[key] = value;
        }
    }

    await updateDoc(userRef, updateData);

    const updatedUserSnapshot = await getDoc(userRef);

    return updatedUserSnapshot.data() as UserData;
}
