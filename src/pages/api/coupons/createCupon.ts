import { firestoreAdmin } from '@/lib/firebase';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        try {
            const { eventId, codigo, discount, type } = req.body;

            const db = firestoreAdmin;

            const couponRef = db
                .collection('events')
                .doc(eventId)
                .collection('coupons')
                .doc(codigo);

            const docSnapshot = await couponRef.get();

            if (docSnapshot.exists) {
                return res.status(409).json({
                    error: 'Um cupom com este código já existe para este evento.',
                });
            }

            await couponRef.set({
                discount,
                type,
                isActive: true,
            });

            res.status(200).json({ message: 'Cupom criado com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar o cupom' });
        }
    } else {
        // Método não suportado!
        res.setHeader('Allow', 'POST');
        res.status(405).end('Método não permitido');
    }
}
