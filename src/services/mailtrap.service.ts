import nodemailer from 'nodemailer';
import { getRequiredEnv } from '../utils/env.util';

export interface MailtrapEmail {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export class MailtrapService {
    private readonly transporter = nodemailer.createTransport({
        host: getRequiredEnv('MAILTRAP_HOST'),
        port: Number(getRequiredEnv('MAILTRAP_PORT')),
        auth: {
            user: getRequiredEnv('MAILTRAP_USERNAME'),
            pass: getRequiredEnv('MAILTRAP_PASSWORD'),
        },
    });

    async sendEmail(email: MailtrapEmail): Promise<void> {
        await this.transporter.sendMail({
            from: getRequiredEnv('MAILTRAP_FROM'),
            to: email.to,
            subject: email.subject,
            html: email.html,
            text: email.text,
        });
    }
}