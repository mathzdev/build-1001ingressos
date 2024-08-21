import { NextApiRequest, NextApiResponse } from 'next';

import { authOptions } from '@/pages/api/auth/[...nextauth]';
import TicketPDF from '@/pdf/ticketPDF';
import { createFreeTickets } from '@/server/db/tickets/createFreeTickets';
import { formatDate, formatTime } from '@/utils/format/date';
import { convertImageToBase64 } from '@/utils/image';
import { renderToBuffer } from '@react-pdf/renderer';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

class CreateFreeTicketsError extends Error {
    type: string;
    statusCode: number;

    constructor(message: string, type: string, statusCode: number = 400) {
        super(message);
        this.name = 'CreateFreeTicketsError';
        this.type = type;
        this.statusCode = statusCode;
    }
}

const schema = z.object({
    eventId: z.string(),
    batchId: z.string(),
    amount: z.number().min(1),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'method_not_allowed',
            message: 'Method not allowed',
        });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        res.status(401).json({
            error: 'unauthorized',
            message: 'You must be logged in.',
        });
        return;
    }

    if (session.user.roleId !== 'X0v3WRX84lSVCK6wsRM5') {
        res.status(403).json({
            error: 'forbidden',
            message: 'You must be an organizer to create free tickets.',
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

    const { eventId, batchId, amount } = parseResponse.data;

    try {
        const { tickets: ticketsData } = await createFreeTickets(
            amount,
            eventId,
            batchId,
            session.user.id
        );

        const logoUrl = await convertImageToBase64(
            'https://firebasestorage.googleapis.com/v0/b/ticket-king-6be25.appspot.com/o/logo_ticketking.png?alt=media&token=2b2eef9c-e3f9-45ee-930f-c84778177aff'
        );

        const eventBannerUrl = await convertImageToBase64(
            ticketsData[0].event.bannerUrl
        );
        const eventName = ticketsData[0].event.name;

        const tickets = ticketsData.map((ticket) => ({
            name: ticket.user.name,
            qrCode: ticket.qrCode,
            ticketCode: ticket.id,
            ticketBatch: ticket.batch.name,
            eventName: ticket.event.name,
            eventDate: formatDate(new Date(ticket.event.startDate)),
            eventTime: formatTime(new Date(ticket.event.startDate)),
            eventPlace: ticket.organizer.name,
            eventBannerUrl,
        }));

        const ticketPdf = TicketPDF({
            tickets,
            logoUrl,
        });

        const pdfBuffer = await renderToBuffer(ticketPdf);

        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Ingressos_${eventName}.pdf`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    } catch (error) {
        if (error instanceof CreateFreeTicketsError) {
            res.status(error.statusCode).json({
                error: error.type,
                message: error.message,
            });
            return;
        }

        console.error(error);

        res.status(500).json({
            error: 'internal_server_error',
            message: 'Internal server error',
        });
        return;
    }
};

export default handler;
