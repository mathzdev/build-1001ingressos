import { NextApiRequest, NextApiResponse } from 'next';

import { storage } from '@/lib/firebaseClient';
import { getDownloadURL, ref } from 'firebase/storage';
import { Options, QRCodeCanvas } from 'styled-qr-code-node';
import { z } from 'zod';

const schema = z.object({
    ticketId: z.string(),
});
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'method_not_allowed',
            message: 'Method not allowed',
        });
    }

    const pathReference = ref(storage, '1001ingressos-qr.png');
    const imageUrl = await getDownloadURL(pathReference);

    try {
        const parseResponse = schema.safeParse(req.body);

        if (!parseResponse.success) {
            res.status(400).json({
                error: 'invalid_request',
                message: parseResponse.error.message,
            });
            return;
        }

        const { ticketId } = parseResponse.data;

        const data = `1001Ingressos://ticket.validate/${ticketId}`;

        const options: Options = {
            width: 300,
            height: 300,
            data,
            image: imageUrl,
            margin: 0,
            qrOptions: {
                typeNumber: 0,
                mode: 'Byte',
                errorCorrectionLevel: 'Q',
            },
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: 0.4,
                margin: 0,
            },
            dotsOptions: { type: 'extra-rounded', color: '#6b6b6b' },
            backgroundOptions: { color: '#ffffff' },
            cornersSquareOptions: { type: 'extra-rounded', color: '#000000' },
            cornersDotOptions: { type: 'dot', color: '#000000' },
        };

        const qrCode = new QRCodeCanvas(options);

        const dataUrl = await qrCode.toDataUrl('image/png');

        res.status(200).json({
            dataUrl,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'internal_server_error',
            message: 'Internal server error',
        });
    }
};

export default handler;
