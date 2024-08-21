import { NextApiRequest, NextApiResponse } from 'next';

import { db } from '@/lib/firebaseClient';
import { getTicketById } from '@/server/db/tickets/getTicketById';
import { TicketStatus } from '@/server/db/tickets/types';
import { DocumentReference, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]';

export interface ValidationResponse {
    id: string;
    status: TicketStatus;
    qrCode: string;
    dateReserved: number;
    dateScanned: number;
    price: number;
    scannedBy: {
        id: string;
        name: string;
    } | null;
    batch: {
        startDate: number;
        endDate: number;
        id: string;
        gender: 'FEMININO' | 'MASCULINO' | 'UNISSEX';
        type: 'PUBLIC' | 'PRIVATE' | 'SECRET';
        price: number;
        name: string;
        availableAmount: number;
        startAmount: number;
        isVisible: boolean;
        minBuyAmount: number;
        maxBuyAmount: number;
        description: string;
        parentBatch: string | null;
    };
    event: {
        id: string;
        name: string;
        slug: string;
        startDate: number;
        endDate: number;
        address: {
            street: string;
            number: string;
            postalCode: string;
            complement: string;
        };
        description: string;
        policy: string;
        bannerUrl: string;
        category: string;
        producer: {
            name: string;
            description: string;
        };
        isVisible: boolean;
    };
    user: {
        id: string;
        cpf?: string | undefined;
        name: string;
        phone: string;
        email: string;
        emailVerified: boolean | null;
        address?:
            | {
                  street: string;
                  number: number;
                  postalCode: string;
                  complement?: string | undefined;
              }
            | undefined;
        roleId?: string | undefined;
        image?: string | undefined;
    };
}

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

    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        res.status(401).json({
            error: 'unauthorized',
            message: 'You must be logged in.',
        });
        return;
    }

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

        const { ticket, batch, event, user } = await getTicketById(ticketId);

        const organizerSnapshot = await getDoc(
            doc(db, 'organizers', event.organizerId)
        );
        const organizer = organizerSnapshot.data() as {
            users: Record<string, DocumentReference>;
        };

        if (organizer.users[session.user.id] === undefined) {
            res.status(403).json({
                error: 'forbidden',
                message: 'You are not allowed to scan this ticket',
            });
            return;
        }

        const {
            couponId,
            dateAcquired,
            dateScanned,
            dateReserved,
            ...ticketData
        } = ticket;
        const {
            startDate: eventStartDate,
            endDate: eventEndDate,
            ...eventData
        } = event;
        const {
            endDate: batchEndDate,
            startDate: batchStartDate,
            ...batchData
        } = batch;

        const now = new Date();

        const response: ValidationResponse = {
            ...ticketData,
            dateReserved:
                typeof dateReserved === 'string'
                    ? new Date(dateReserved).getTime()
                    : dateReserved.toMillis(),
            dateScanned: now.getTime(),
            batch: {
                ...batchData,
                startDate: batchStartDate.toMillis(),
                endDate: batchEndDate.toMillis(),
            },
            event: {
                ...eventData,
                startDate: eventStartDate.toMillis(),
                endDate: eventEndDate.toMillis(),
            },
            user,
        };

        if (ticket.dateScanned) {
            response.dateScanned = ticket.dateScanned.toMillis();
            res.status(400).json({
                error: 'ticket_already_scanned',
                message: 'Ticket already scanned',
                data: {
                    name: ticket.scannedBy?.name ?? '',
                    ticket: response,
                },
            });
            return;
        }

        if (ticket.status !== 'PAID') {
            res.status(402).json({
                error: 'not_paid',
                message: 'Ticket is not paid',
            });
            return;
        }

        const ticketRef = doc(db, 'tickets', ticketId);
        await updateDoc(ticketRef, {
            status: 'SCANNED',
            dateScanned: now,
            scannedBy: {
                id: session.user.id,
                name: session.user.name,
            },
        });

        response.scannedBy = {
            id: session.user.id,
            name: session.user.name,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'internal_server_error',
            message: 'Internal server error',
        });
    }
};

export default handler;
