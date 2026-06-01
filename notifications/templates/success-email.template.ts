import { NotificationPayload } from '../../src/types/notification.types';

export function buildSuccessEmailTemplate(payload: NotificationPayload): string {
    return `
    <div style="font-family: Arial, sans-serif; color: #1f2937;">
      <h2 style="color: #16a34a;">Checkout monitor exitoso</h2>

      <p>La prueba automatizada finalizó correctamente.</p>

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
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Total pagado</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.totalPaid || 'No capturado'}</td>
        </tr>
        <tr>
  <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Completa pago</strong></td>
  <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.completePayment ? 'Sí' : 'No'}</td>
</tr>
<tr>
  <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Aplica cupón</strong></td>
  <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.applyDiscount ? 'Sí' : 'No'}</td>
</tr>
<tr>
  <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Total cobrado</strong></td>
  <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.totalPaid || 'No capturado'}</td>
</tr>
        
      </table>
    </div>
  `;
}