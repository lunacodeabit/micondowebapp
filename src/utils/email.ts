import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// =============================================
// EMAIL SERVICE - Firebase Trigger Email Extension
// =============================================

// Tipos de email
export type EmailType =
    | 'payment_confirmation'
    | 'payment_reminder'
    | 'welcome'
    | 'announcement'
    | 'grace_period_warning'
    | 'account_suspended';

export interface EmailData {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}

// Colección donde Firebase Extension escucha
const MAIL_COLLECTION = 'mail';

/**
 * Envía un email usando Firebase Trigger Email Extension
 * @param emailData - Datos del email (to, subject, html)
 * @returns ID del documento creado
 */
export const sendEmail = async (emailData: EmailData): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, MAIL_COLLECTION), {
            to: emailData.to,
            message: {
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text || '',
            },
            createdAt: Timestamp.now(),
        });

        console.log('Email queued with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// =============================================
// EMAIL TEMPLATES - Diseño Premium MI CONDO
// =============================================

const emailStyles = `
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background-color: #1E3A5F; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; }
    .header p { color: #B0B0B0; margin: 5px 0 0; font-size: 12px; }
    .gold-bar { height: 4px; background: linear-gradient(90deg, #B8860B, #D4AF37, #B8860B); }
    .content { padding: 40px 30px; }
    .content h2 { color: #1E3A5F; margin-top: 0; }
    .content p { color: #333333; line-height: 1.6; }
    .highlight-box { background: #F8F9FA; border-left: 4px solid #B8860B; padding: 15px 20px; margin: 20px 0; }
    .amount { font-size: 32px; color: #1E3A5F; font-weight: bold; }
    .btn { display: inline-block; background: #1E3A5F; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .btn:hover { background: #2C4A6E; }
    .footer { background: #1E3A5F; padding: 20px 30px; text-align: center; }
    .footer p { color: #B0B0B0; font-size: 12px; margin: 5px 0; }
    .footer a { color: #D4AF37; text-decoration: none; }
  </style>
`;

const emailHeader = `
  <div class="header">
    <h1>MI CONDO</h1>
    <p>SISTEMA DE ADMINISTRACIÓN DE CONDOMINIOS</p>
  </div>
  <div class="gold-bar"></div>
`;

const emailFooter = `
  <div class="footer">
    <p>Este es un correo automático de MI CONDO.</p>
    <p>Por favor, no responda a este mensaje.</p>
    <p><a href="#">www.micondo.app</a></p>
  </div>
`;

/**
 * Template: Confirmación de Pago
 */
export const getPaymentConfirmationEmail = (data: {
    companyName: string;
    amount: number;
    paymentDate: string;
    receiptNumber: string;
    periodStart: string;
    periodEnd: string;
}): EmailData => ({
    to: '', // Se llenará al llamar
    subject: `✓ Pago Confirmado - ${data.companyName} | MI CONDO`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        ${emailHeader}
        <div class="content">
          <h2>¡Pago Recibido Exitosamente!</h2>
          <p>Estimado cliente de <strong>${data.companyName}</strong>,</p>
          <p>Hemos recibido su pago correctamente. A continuación los detalles:</p>
          
          <div class="highlight-box">
            <p style="margin: 0; color: #666;">Monto pagado</p>
            <p class="amount">RD$ ${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Recibo N°:</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.receiptNumber}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Fecha de pago:</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.paymentDate}</td></tr>
            <tr><td style="padding: 10px 0;"><strong>Período:</strong></td><td style="padding: 10px 0;">${data.periodStart} - ${data.periodEnd}</td></tr>
          </table>
          
          <p>Gracias por su preferencia.</p>
        </div>
        ${emailFooter}
      </div>
    </body>
    </html>
  `,
});

/**
 * Template: Recordatorio de Pago
 */
export const getPaymentReminderEmail = (data: {
    companyName: string;
    amount: number;
    dueDate: string;
    daysOverdue?: number;
}): EmailData => ({
    to: '',
    subject: `⚠️ Recordatorio de Pago - ${data.companyName} | MI CONDO`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        ${emailHeader}
        <div class="content">
          <h2>Recordatorio de Pago</h2>
          <p>Estimado cliente de <strong>${data.companyName}</strong>,</p>
          <p>Le recordamos que su suscripción a MI CONDO ${data.daysOverdue ? `tiene ${data.daysOverdue} días de atraso` : 'está próxima a vencer'}.</p>
          
          <div class="highlight-box" style="border-color: #E74C3C;">
            <p style="margin: 0; color: #666;">Monto pendiente</p>
            <p class="amount" style="color: #E74C3C;">RD$ ${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p style="margin: 5px 0 0; color: #666;">Vencimiento: ${data.dueDate}</p>
          </div>
          
          <p>Para evitar la suspensión de su servicio, por favor realice su pago a la brevedad posible.</p>
          
          <p><strong>Métodos de pago disponibles:</strong></p>
          <ul>
            <li>Transferencia bancaria</li>
            <li>Depósito en cuenta</li>
            <li>Pago en línea</li>
          </ul>
          
          <p>Si ya realizó su pago, por favor ignore este mensaje.</p>
        </div>
        ${emailFooter}
      </div>
    </body>
    </html>
  `,
});

/**
 * Template: Bienvenida
 */
export const getWelcomeEmail = (data: {
    companyName: string;
    adminName: string;
    trialEndDate: string;
}): EmailData => ({
    to: '',
    subject: `🎉 Bienvenido a MI CONDO - ${data.companyName}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        ${emailHeader}
        <div class="content">
          <h2>¡Bienvenido a MI CONDO!</h2>
          <p>Hola <strong>${data.adminName}</strong>,</p>
          <p>Gracias por registrar <strong>${data.companyName}</strong> en MI CONDO, la plataforma líder de administración de condominios.</p>
          
          <div class="highlight-box">
            <p style="margin: 0;"><strong>🎁 Período de prueba gratuito</strong></p>
            <p style="margin: 5px 0 0;">Disfruta de todas las funcionalidades hasta el <strong>${data.trialEndDate}</strong></p>
          </div>
          
          <p><strong>¿Qué puedes hacer con MI CONDO?</strong></p>
          <ul>
            <li>✓ Gestionar múltiples condominios</li>
            <li>✓ Control de pagos y cuotas</li>
            <li>✓ Comunicación con residentes</li>
            <li>✓ Reportes y estados de cuenta</li>
            <li>✓ Generación de recibos PDF</li>
          </ul>
          
          <a href="#" class="btn">Acceder a MI CONDO</a>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        ${emailFooter}
      </div>
    </body>
    </html>
  `,
});

/**
 * Template: Anuncio General
 */
export const getAnnouncementEmail = (data: {
    title: string;
    content: string;
    type: 'info' | 'warning' | 'update' | 'maintenance';
}): EmailData => {
    const typeColors: Record<string, string> = {
        info: '#3498DB',
        warning: '#E74C3C',
        update: '#27AE60',
        maintenance: '#F39C12',
    };

    const typeIcons: Record<string, string> = {
        info: 'ℹ️',
        warning: '⚠️',
        update: '✨',
        maintenance: '🔧',
    };

    return {
        to: '',
        subject: `${typeIcons[data.type]} ${data.title} | MI CONDO`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>${emailStyles}</head>
      <body>
        <div class="container">
          ${emailHeader}
          <div class="content">
            <h2 style="color: ${typeColors[data.type]};">${typeIcons[data.type]} ${data.title}</h2>
            <div style="line-height: 1.8;">
              ${data.content.replace(/\n/g, '<br>')}
            </div>
          </div>
          ${emailFooter}
        </div>
      </body>
      </html>
    `,
    };
};

/**
 * Template: Cuenta Suspendida
 */
export const getAccountSuspendedEmail = (data: {
    companyName: string;
    suspensionDate: string;
    amountDue: number;
}): EmailData => ({
    to: '',
    subject: `🔒 Cuenta Suspendida - ${data.companyName} | MI CONDO`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        ${emailHeader}
        <div class="content">
          <h2 style="color: #E74C3C;">Cuenta Suspendida</h2>
          <p>Estimado cliente de <strong>${data.companyName}</strong>,</p>
          <p>Lamentamos informarle que su cuenta ha sido suspendida por falta de pago desde el <strong>${data.suspensionDate}</strong>.</p>
          
          <div class="highlight-box" style="border-color: #E74C3C; background: #FEF5F5;">
            <p style="margin: 0; color: #E74C3C;"><strong>Saldo pendiente:</strong></p>
            <p class="amount" style="color: #E74C3C;">RD$ ${data.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          
          <p><strong>¿Cómo reactivar su cuenta?</strong></p>
          <ol>
            <li>Realice el pago del saldo pendiente</li>
            <li>Envíe el comprobante a nuestro equipo de soporte</li>
            <li>Su cuenta será reactivada en las próximas 24 horas</li>
          </ol>
          
          <p>Todos sus datos están seguros y serán restaurados una vez regularice su situación.</p>
        </div>
        ${emailFooter}
      </div>
    </body>
    </html>
  `,
});
