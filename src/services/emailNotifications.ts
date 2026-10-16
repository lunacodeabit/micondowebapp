import { supabase } from '../supabaseClient';
import {
  sendEmail,
  getPaymentConfirmationEmail,
  getPaymentReminderEmail,
  getWelcomeEmail,
  getAnnouncementEmail,
  getGracePeriodWarningEmail,
  getAccountSuspendedEmail,
} from '../utils/email';

// =============================================
// EMAIL NOTIFICATION SERVICE
// High-level functions that fetch context and send emails
// =============================================

/**
 * Fetch admin email for a company
 */
async function getCompanyAdminEmail(companyId: string): Promise<string | null> {
  const { data } = await supabase
    .from('companies')
    .select('admin_email, name')
    .eq('id', companyId)
    .single();
  return data?.admin_email || null;
}

/**
 * Fetch company name by ID
 */
async function getCompanyName(companyId: string): Promise<string> {
  const { data } = await supabase
    .from('companies')
    .select('name')
    .eq('id', companyId)
    .single();
  return data?.name || 'Su empresa';
}

/**
 * Send payment confirmation email to company admin
 */
export async function notifyPaymentConfirmation(
  companyId: string,
  amount: number,
  receiptNumber: string,
  periodStart: string,
  periodEnd: string
): Promise<boolean> {
  try {
    const email = await getCompanyAdminEmail(companyId);
    if (!email) {
      console.warn(`No admin email found for company ${companyId}`);
      return false;
    }

    const companyName = await getCompanyName(companyId);
    const template = getPaymentConfirmationEmail({
      companyName,
      amount,
      paymentDate: new Date().toLocaleDateString('es-DO'),
      receiptNumber,
      periodStart,
      periodEnd,
    });

    await sendEmail({ ...template, to: email });
    return true;
  } catch (error) {
    console.error('Failed to send payment confirmation:', error);
    return false;
  }
}

/**
 * Send payment reminder to company admin
 */
export async function notifyPaymentReminder(
  companyId: string,
  amount: number,
  dueDate: string,
  daysOverdue?: number
): Promise<boolean> {
  try {
    const email = await getCompanyAdminEmail(companyId);
    if (!email) return false;

    const companyName = await getCompanyName(companyId);
    const template = getPaymentReminderEmail({
      companyName,
      amount,
      dueDate,
      daysOverdue,
    });

    await sendEmail({ ...template, to: email });
    return true;
  } catch (error) {
    console.error('Failed to send payment reminder:', error);
    return false;
  }
}

/**
 * Send welcome email to new company admin
 */
export async function notifyWelcome(
  companyId: string,
  adminName: string,
  adminEmail: string,
  trialEndDate: string
): Promise<boolean> {
  try {
    const companyName = await getCompanyName(companyId);
    const template = getWelcomeEmail({
      companyName,
      adminName,
      trialEndDate,
    });

    await sendEmail({ ...template, to: adminEmail });
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

/**
 * Send grace period warning
 */
export async function notifyGracePeriodWarning(
  companyId: string,
  daysLeft: number,
  amount: number
): Promise<boolean> {
  try {
    const email = await getCompanyAdminEmail(companyId);
    if (!email) return false;

    const companyName = await getCompanyName(companyId);
    const template = getGracePeriodWarningEmail({
      companyName,
      daysLeft,
      amount,
    });

    await sendEmail({ ...template, to: email });
    return true;
  } catch (error) {
    console.error('Failed to send grace period warning:', error);
    return false;
  }
}

/**
 * Send account suspended notification
 */
export async function notifyAccountSuspended(
  companyId: string,
  amountDue: number
): Promise<boolean> {
  try {
    const email = await getCompanyAdminEmail(companyId);
    if (!email) return false;

    const companyName = await getCompanyName(companyId);
    const template = getAccountSuspendedEmail({
      companyName,
      suspensionDate: new Date().toLocaleDateString('es-DO'),
      amountDue,
    });

    await sendEmail({ ...template, to: email });
    return true;
  } catch (error) {
    console.error('Failed to send suspension notice:', error);
    return false;
  }
}

/**
 * Send announcement to multiple emails
 */
export async function notifyAnnouncement(
  emails: string[],
  title: string,
  content: string,
  type: 'info' | 'warning' | 'update' | 'maintenance' = 'info'
): Promise<boolean> {
  try {
    const template = getAnnouncementEmail({ title, content, type });
    await sendEmail({ ...template, to: emails });
    return true;
  } catch (error) {
    console.error('Failed to send announcement:', error);
    return false;
  }
}
