import * as nodemailer from 'nodemailer';

import '../utils/env.util';

type NotificationStatus = 'SUCCESS' | 'ERROR';

type NotificationPayload = {
    subject: string;
    status: NotificationStatus;
    environment: string;
    baseUrl: string;
    executionId: string;
    country?: string;
    continent?: string;
    psychologistName?: string;
    planName?: string;
    discountCode?: string;
    totalPaid?: string;
    completePayment?: boolean;
    applyDiscount?: boolean;
    targetDate?: string;
    currentUrl?: string;
    currentStep?: string;
    errorMessage?: string;
    screenshotPath?: string;
};

export class NotificationService {
    async sendSuccessNotification(payload: NotificationPayload): Promise<void> {
        await this.sendEmail({
            ...payload,
            subject: `[ÉXITO] Monitor de comprobación - ${payload.environment}`,
            status: 'SUCCESS',
        });
    }

    async sendErrorNotification(payload: NotificationPayload): Promise<void> {
        await this.sendEmail({
            ...payload,
            subject: `[ERROR] Monitor de comprobación - ${payload.environment}`,
            status: 'ERROR',
        });
    }

    private async sendEmail(payload: NotificationPayload): Promise<void> {
        const host = process.env.MAILTRAP_HOST;
        const port = Number(process.env.MAILTRAP_PORT || 2525);
        const username = process.env.MAILTRAP_USERNAME;
        const password = process.env.MAILTRAP_PASSWORD;
        const from = process.env.MAILTRAP_FROM;
        const to = process.env.MAILTRAP_TO;

        if (!host || !username || !password || !from || !to) {
            throw new Error(
                'Faltan variables de Mailtrap: MAILTRAP_HOST, MAILTRAP_USERNAME, MAILTRAP_PASSWORD, MAILTRAP_FROM o MAILTRAP_TO.',
            );
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user: username,
                pass: password,
            },
        });

        await transporter.sendMail({
            from,
            to,
            subject: payload.subject,
            text: this.buildText(payload),
            html: this.buildHtml(payload),
            attachments: payload.screenshotPath
                ? [
                    {
                        filename: 'checkout-error.png',
                        path: payload.screenshotPath,
                    },
                ]
                : [],
        });
    }

    private buildText(payload: NotificationPayload): string {
        return [
            `Estado: ${payload.status}`,
            `Ambiente: ${payload.environment}`,
            `URL: ${payload.baseUrl}`,
            `ID ejecución: ${payload.executionId}`,
            `Paso actual: ${payload.currentStep || 'No aplica'}`,
            `Fecha objetivo: ${payload.targetDate || 'No aplica'}`,
            `País: ${payload.country || 'No aplica'}`,
            `Continente: ${payload.continent || 'No aplica'}`,
            `Psicóloga/o: ${payload.psychologistName || 'No aplica'}`,
            `Plan: ${payload.planName || 'No aplica'}`,
            `Cupón aplicado: ${payload.applyDiscount ? 'Sí' : 'No'}`,
            `Código cupón: ${payload.discountCode || 'No aplica'}`,
            `Completa pago: ${payload.completePayment ? 'Sí' : 'No'}`,
            `Total cobrado: ${payload.totalPaid || 'No capturado'}`,
            `URL actual: ${payload.currentUrl || 'No capturada'}`,
            `Error: ${payload.errorMessage || 'No aplica'}`,
        ].join('\n');
    }

    private buildHtml(payload: NotificationPayload): string {
        const isSuccess = payload.status === 'SUCCESS';
        const title = isSuccess
            ? 'Checkout monitor exitoso'
            : 'Checkout monitor con error';

        const titleColor = isSuccess ? '#15803d' : '#b91c1c';

        return `
      <!doctype html>
      <html lang="es">
        <body style="font-family: Arial, sans-serif; background: #f8f7ff; padding: 24px;">
          <div style="max-width: 760px; margin: 0 auto; background: #ffffff; border-radius: 14px; padding: 24px; border: 1px solid #e6e1f5;">
            <h2 style="margin: 0 0 12px; color: ${titleColor};">${title}</h2>
            <p style="margin: 0 0 20px; color: #312a67;">
              La prueba automatizada del proceso de compra finalizó con estado:
              <strong>${payload.status}</strong>.
            </p>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              ${this.row('Ambiente', payload.environment)}
              ${this.row('URL base', payload.baseUrl)}
              ${this.row('ID ejecución', payload.executionId)}
              ${this.row('Paso actual', payload.currentStep || 'No aplica')}
              ${this.row('Fecha objetivo', payload.targetDate || 'No aplica')}
              ${this.row('País', payload.country || 'No aplica')}
              ${this.row('Continente', payload.continent || 'No aplica')}
              ${this.row('Psicóloga/o', payload.psychologistName || 'No aplica')}
              ${this.row('Plan', payload.planName || 'No aplica')}
              ${this.row('Completa pago', payload.completePayment ? 'Sí' : 'No')}
              ${this.row('Aplica cupón', payload.applyDiscount ? 'Sí' : 'No')}
              ${this.row('Código cupón', payload.discountCode || 'No aplica')}
              ${this.row('Total cobrado', payload.totalPaid || 'No capturado')}
              ${this.row('URL actual', payload.currentUrl || 'No capturada')}
              ${this.row('Error', payload.errorMessage || 'No aplica')}
            </table>

            ${
            payload.screenshotPath
                ? '<p style="margin-top: 18px; color: #6b638d;">Se adjunta captura del error.</p>'
                : ''
        }
          </div>
        </body>
      </html>
    `;
    }

    private row(label: string, value: string): string {
        return `
      <tr>
        <td style="border: 1px solid #e6e1f5; padding: 10px; font-weight: 700; color: #312a67; width: 220px;">
          ${this.escapeHtml(label)}
        </td>
        <td style="border: 1px solid #e6e1f5; padding: 10px; color: #20183f;">
          ${this.escapeHtml(value)}
        </td>
      </tr>
    `;
    }

    private escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}