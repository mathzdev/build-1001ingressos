import sanitizedEnv from '@/config/env';
import { formatDate, formatTime } from '@/utils/format/date';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import Email from '../../../emails';

const transporter = nodemailer.createTransport({
    host: sanitizedEnv.EMAIL_HOST,
    port: sanitizedEnv.EMAIL_PORT,
    secure: true,
    auth: {
        user: sanitizedEnv.EMAIL_USER,
        pass: sanitizedEnv.EMAIL_PASSWORD,
    },
});

const baseMailOptions = {
    from: sanitizedEnv.EMAIL_FROM,
    subject: sanitizedEnv.EMAIL_SUBJECT,
};
interface EmailData {
    qrCode: string;
    eventBannerUrl: string;
    eventName: string;
    name: string;
    eventPlace: string;
    ticketBatch: string;
    ticketCode: string;
    eventDateRaw: Date;
    ticketUrl: string;
}

export const sendMail = async (
    to: string,
    data: EmailData,
    subject: string = sanitizedEnv.EMAIL_SUBJECT
) => {
    const { eventDateRaw, ...rest } = data;
    const eventDate = formatDate(eventDateRaw);
    const eventTime = formatTime(eventDateRaw);
    console.log(`Sending email to ${to} with ticket ${data.ticketCode}`);

    const dottedLine =
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACuSURBVHgBpZAtDoQwEIWnBIGsAV2HAMEV9gSLxvUmuyepJDhuwBFAoFAoRCu6pklVu9Nk17fhM/OTzHuTRwARQtCiKHpsGUTgvd+GYZhDT8ZxZISQpSxLVlVVzD1oreG6rhOFHjnOr6ZpWNu2kMK6ruw4DpGh+7Oua0jlZ9hlcJMgsO37Dqng+6HMOQbBcViMMYxSGnWslAIpZQjxTf7LaZp651wHcZzW2plz/vkChCJEQrMNssYAAAAASUVORK5CYII=';

    const emailHtml = render(
        Email({
            ...rest,
            eventDate,
            eventTime,
        })
    );

    const mailOptions = {
        from: sanitizedEnv.EMAIL_FROM,
        to,
        subject,
        html: emailHtml,
    };

    await transporter.sendMail({
        ...mailOptions,
        attachments: [
            {
                contentType: 'image/png',
                content: data.qrCode.replace('data:image/png;base64,', ''),
                filename: 'qrCode.png',
                contentTransferEncoding: 'base64',
                contentDisposition: 'inline',
                encoding: 'base64',
                cid: 'qrCode',
            },
            {
                contentType: 'image/png',
                content: dottedLine,
                filename: 'dottedLine.png',
                contentTransferEncoding: 'base64',
                contentDisposition: 'inline',
                encoding: 'base64',
                cid: 'dottedLine',
            },
        ],
    });
};
