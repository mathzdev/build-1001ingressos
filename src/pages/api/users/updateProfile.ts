// pages/api/createUser.ts
import updateProfile from '@/server/db/users/updateProfile';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]';

const schema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    cpf: z.string().optional(),
    phone: z.string().optional(),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        res.status(401).json({
            error: 'unauthorized',
            message: 'You must be logged in.',
        });
        return;
    }

    const parseResponse = schema.safeParse(req.body);

    if (!parseResponse.success) {
        res.status(400).json({
            error: 'invalid_request',
            message: parseResponse.error.message,
        });
        return;
    }

    const { name, phone, email, cpf } = parseResponse.data;

    try {
        const user = await updateProfile(session.user.id, {
            name,
            phone,
            email,
            cpf,
        });

        return res.status(200).json(user);
    } catch (error: any) {
        console.error('Erro ao criar usuário:', error);
        return res.status(500).json({
            code: 'internal_server_error',
            message: error.message,
        });
    }
};

export default handler;
