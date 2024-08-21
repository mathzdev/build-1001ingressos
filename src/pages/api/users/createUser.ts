import { firestoreAdmin } from '@/lib/firebase';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const { email, password, name, phone } = req.body;

    // const { isValid, error } = checkPassword(password);

    // if (!isValid) {
    //     return res.status(400).json(error);
    // }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const db = firestoreAdmin;

        const querySnapshot = await db
            .collection('users')
            .where('email', '==', email)
            .get();

        if (!querySnapshot.empty) {
            return res.status(409).json({
                code: 'email_already_exists',
                message: 'Email já cadastrado',
            });
        }

        const userRecord = await db.collection('users').add({
            name,
            email,
            emailVerified: null,
            image: null,
            password: hashedPassword,
            phone,
        });

        return res.status(200).json(userRecord);
    } catch (error: any) {
        console.error('Erro ao criar usuário:', error);
        return res.status(500).json({
            code: 'internal_server_error',
            message: error.message,
        });
    }
};

export default handler;
