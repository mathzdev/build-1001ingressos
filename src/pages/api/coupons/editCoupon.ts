import { firestoreAdmin } from '@/lib/firebase';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'PUT') {
        try {
            const { eventId, oldCouponCode, newCouponCode, discount, type } =
                req.body;

            const db = firestoreAdmin;

            const oldCouponRef = db
                .collection('events')
                .doc(eventId)
                .collection('coupons')
                .doc(oldCouponCode);

            const oldDocSnapshot = await oldCouponRef.get();

            if (!oldDocSnapshot.exists) {
                return res
                    .status(404)
                    .json({ error: 'Cupom antigo não encontrado.' });
            }

            const newCouponRef = db
                .collection('events')
                .doc(eventId)
                .collection('coupons')
                .doc(newCouponCode);

            await newCouponRef.set({
                discount,
                type,
                isActive: true,
            });

            if (newCouponCode !== oldCouponCode) {
                await oldCouponRef.delete();
            }
            res.status(200).json({ message: 'Cupom atualizado com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar o cupom' });
        }
    } else {
        res.setHeader('Allow', 'PUT');
        res.status(405).end('Método não permitido');
    }
}
