import { NextApiRequest, NextApiResponse } from 'next';

import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { createBatch } from '@/server/db/batch/createBatch';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

class CreateBatchError extends Error {
    type: string;
    statusCode: number;

    constructor(message: string, type: string, statusCode: number = 400) {
        super(message);
        this.name = 'CreateBatchError';
        this.type = type;
        this.statusCode = statusCode;
    }
}

const schema = z.object({
    eventId: z.string(),
    name: z.string().min(1),
    gender: z.union([
        z.literal('FEMININO'),
        z.literal('MASCULINO'),
        z.literal('UNISSEX'),
    ]),
    type: z.union([
        z.literal('PUBLIC'),
        z.literal('PRIVATE'),
        z.literal('SECRET'),
    ]),
    price: z.union([z.number().min(5), z.literal(0)]),
    availableAmount: z.number().min(0),
    startAmount: z.number().min(0),
    isVisible: z.boolean(),
    startDate: z.string(),
    endDate: z.string(),
    minBuyAmount: z.number().min(1),
    maxBuyAmount: z.number().min(1),
    description: z.string().optional().nullable(),
    parentBatch: z.string().optional().nullable(),
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

    const allowedRoles = ['X0v3WRX84lSVCK6wsRM5', 'Fuz4gzZy95ZVoj8dJgIo'];

    if (!session.user.roleId || !allowedRoles.includes(session.user.roleId)) {
        res.status(403).json({
            error: 'forbidden',
            message: 'You must be an organizer to create batches.',
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

    const { eventId, parentBatch, description, ...batchData } =
        parseResponse.data;

    const startDate = new Date(batchData.startDate);
    const endDate = new Date(batchData.endDate);

    try {
        if (startDate > endDate) {
            throw new CreateBatchError(
                'Start date must be before end date',
                'start_date_after_end_date'
            );
        }

        const batchId = await createBatch(eventId, {
            ...batchData,
            description: description ?? null,
            parentBatch: parentBatch ?? null,
            startDate,
            endDate,
        });

        res.status(200).json({
            id: batchId,
            ...batchData,
            description: description ?? null,
            parentBatch: parentBatch ?? null,
            startDate: startDate.getTime(),
            endDate: endDate.getTime(),
        });
    } catch (error) {
        if (error instanceof CreateBatchError) {
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
