import { firestoreAdmin } from '@/lib/firebase';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const {
        organizerId,
        name,
        slug,
        date,
        time,
        endDate,
        endTime,
        address,
        description,
        batches,
        policy,
        bannerUrl,
        category,
        producer,
        isVisible,
    } = req.body;

    // Aqui, você pode adicionar sua lógica de validação de evento
    // Por exemplo, verificar se todos os campos obrigatórios estão presentes

    try {
        const db = firestoreAdmin;

        // Verificação adicional (se necessário)
        // Por exemplo, verificar se o organizador existe

        const eventRecord = await db.collection('events').add({
            organizerId,
            name,
            slug, // Certifique-se de que o slug é único ou gere um automaticamente
            date,
            time,
            endDate,
            endTime,
            address,
            description,
            batches,
            policy,
            bannerUrl,
            category,
            producer,
            isVisible,
        });

        return res.status(200).json(eventRecord);
    } catch (error: any) {
        console.error('Erro ao adicionar evento:', error);
        return res.status(500).json({
            code: 'internal_server_error',
            message: error.message,
        });
    }
};

export default handler;
