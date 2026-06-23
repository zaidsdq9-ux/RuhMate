/**
 * Manual bank-transfer payment details for RuhMate.
 *
 * There is no online payment gateway in this version. Customers pay by bank
 * transfer to one of the accounts below, send the receipt to the WhatsApp
 * number, and an admin manually approves the request (granting the plan's
 * points) from the /admin/payments queue.
 *
 * Keep this file dependency-free (no React, no firebase) so it imports cleanly
 * into server components, client components, and route handlers. To change the
 * bank details or WhatsApp number, edit the constants here and redeploy.
 */

export interface BankAccount {
  account_name: string;
  bank: string;
  branch: string;
  account_number: string;
}

/** Bank accounts customers can transfer to (any one of them). */
export const BANK_ACCOUNTS: readonly BankAccount[] = [
  {
    account_name: 'I.A. ANAS',
    bank: 'Sampath Bank',
    branch: 'Kochchikade Branch',
    account_number: '1165 5752 0606',
  },
  {
    account_name: 'I.A. Anas',
    bank: 'Commercial Bank',
    branch: 'Kochchikade Branch',
    account_number: '8014 3132 53',
  },
];

/** WhatsApp number to send the payment receipt to (display form). */
export const PAYMENT_WHATSAPP_DISPLAY = '+94 77 885 9896';

/** Same number, digits only, for wa.me deep links. */
export const PAYMENT_WHATSAPP_DIGITS = '94778859896';

/**
 * Build a prefilled WhatsApp deep link for sending the payment receipt. The
 * message includes the plan, amount, and request id so the admin can match the
 * receipt to the queue entry.
 */
export function buildWhatsAppLink(opts: {
  planName: string;
  amountLkr: number;
  requestId: string;
}): string {
  const message =
    `Hi, I've made the payment for the *${opts.planName}* plan ` +
    `(Rs. ${opts.amountLkr.toLocaleString('en-LK')}). ` +
    `My request reference is ${opts.requestId}. ` +
    `Attaching my bank transfer receipt.`;
  return `https://wa.me/${PAYMENT_WHATSAPP_DIGITS}?text=${encodeURIComponent(message)}`;
}
