import { NotificationPayload } from '../../src/types/notification.types';

export function buildErrorEmailTemplate(payload: NotificationPayload): string {
    return `
    <div style="font-family: Arial, sans-serif; color: #1f2937;">
      <h2 style="color: #dc2626;">Checkout monitor fallido</h2>

      <p>La prueba automatizada detectó un error.</p>

      <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Ambiente</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.environment}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>URL</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.baseUrl}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>ID ejecución</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.executionId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>País</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.country}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Continente</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.continent}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Paso fallido</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.failedStep || 'No definido'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Error</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.errorMessage || 'No definido'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Psicóloga</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.psychologistName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Plan</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.planName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Cupón</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.discountCode}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Screenshot</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.screenshotPath || 'No disponible'}</td>
        </tr>
      </table>
    </div>
  `;
}