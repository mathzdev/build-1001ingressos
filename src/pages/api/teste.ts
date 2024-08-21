import paymentGateways from '@/server/paymentGateways';
import { NextApiRequest, NextApiResponse } from 'next';

import { isAxiosError } from 'axios';
import { z } from 'zod';

function getRemoteIp(req: NextApiRequest) {
    let forwardedFor = req.headers['x-forwarded-for'];
    let remoteIp: string | undefined = '';
    if (forwardedFor) {
        forwardedFor =
            typeof forwardedFor === 'string' ? forwardedFor : forwardedFor[0];
        remoteIp = forwardedFor.split(',').shift() ?? req.socket.remoteAddress;
        remoteIp = remoteIp?.replace('::ffff:', '');
    }
    if (remoteIp === '::1' || remoteIp === '127.0.0.1') {
        remoteIp = undefined;
    }
    return remoteIp;
}

const schema = z.object({
    customer: z.object({
        name: z.string(),
        cpfCnpj: z.string(),
        email: z.string(),
        phone: z.string().optional(),
        address: z.object({
            street: z.string(),
            number: z.string(),
            complement: z.string().optional(),
            neighborhood: z.string().optional(),
            zipCode: z.string(),
        }),
    }),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'method_not_allowed',
            message: 'Method not allowed',
        });
    }

    const remoteIp = getRemoteIp(req);

    const parseResponse = schema.safeParse(req.body);

    if (!parseResponse.success) {
        console.error(parseResponse.error);

        res.status(400).json({
            error: 'invalid_request',
            message: parseResponse.error.message,
        });
        return;
    }

    const { customer } = parseResponse.data;

    const paymentGateway = paymentGateways['PIX'];

    try {
        const payment = await paymentGateway.createPayment({
            value: -10,
            dueDate: new Date(),
            remoteIp,
            customer,
        });

        // set all undefined keys to null
        console.log(payment);
        for (const key in payment) {
            const parsedKey = key as keyof typeof payment;
            if (payment[parsedKey] === undefined) {
                // @ts-ignore
                payment[parsedKey] = null;
            }
        }
        console.log(payment);

        return res.status(200).send(payment);
    } catch (error) {
        console.log(error);
        if (isAxiosError(error)) {
            console.error(error.response?.data?.errors);

            return res.status(400).send({
                error: 'payment_error',
                message: error.response?.data?.errors[0],
            });
        }
        res.status(500).send({
            error: 'unknown_payment_error',
            message: 'Não foi possível processar o pagamento',
        });
    }
};

export default handler;
