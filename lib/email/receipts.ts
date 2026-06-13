import { logger } from '@/lib/logger';

const FROM = 'RuhMate <noreply@ruhmate.app>';
const RESEND_URL = 'https://api.resend.com/emails';

export interface ReceiptInput {
  to: string;
  full_name: string;
  order_id: string;
  pack_name: string;
  points: number;
  amount_lkr: number;
  new_balance: number;
}

/**
 * Send a purchase receipt via Resend. No-ops when RESEND_API_KEY is missing,
 * so the build + dev flow don't fail when the key hasn't been provisioned yet.
 *
 * Returns true on send, false otherwise. Never throws — receipts are nice-to-have.
 */
export async function sendPurchaseReceipt(input: ReceiptInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.debug('RESEND_API_KEY missing — purchase receipt skipped');
    return false;
  }
  if (!input.to.trim()) return false;

  const subject = `Receipt: ${input.points} points added to your RuhMate wallet`;
  const html = `
<!doctype html>
<html>
  <body style="margin:0;background:#fff;color:#1a1a1a;font-family:Inter,system-ui,sans-serif;">
    <table align="center" width="560" style="margin:24px auto;border:1px solid #ececec;border-radius:14px;overflow:hidden;">
      <tr><td style="padding:24px 28px;background:#ffe9f6;">
        <div style="font-family:Georgia,serif;font-size:24px;color:#1a1a1a;">RuhMate</div>
        <div style="font-size:13px;color:#6b6b6b;margin-top:4px;">Purchase receipt</div>
      </td></tr>
      <tr><td style="padding:28px;">
        <p style="margin:0 0 12px;font-size:15px;">Hi ${escapeHtml(input.full_name) || 'there'},</p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#1a1a1a;">
          Thank you for your purchase. Your points have been added to your wallet.
        </p>
        <table width="100%" style="font-size:14px;border-top:1px solid #ececec;margin-top:12px;">
          <tr><td style="padding:10px 0;color:#6b6b6b;">Pack</td><td style="padding:10px 0;text-align:right;">${escapeHtml(input.pack_name)}</td></tr>
          <tr><td style="padding:10px 0;color:#6b6b6b;border-top:1px solid #ececec;">Points added</td><td style="padding:10px 0;text-align:right;border-top:1px solid #ececec;">+${input.points}</td></tr>
          <tr><td style="padding:10px 0;color:#6b6b6b;border-top:1px solid #ececec;">Amount paid</td><td style="padding:10px 0;text-align:right;border-top:1px solid #ececec;">Rs. ${input.amount_lkr.toLocaleString()}</td></tr>
          <tr><td style="padding:10px 0;color:#6b6b6b;border-top:1px solid #ececec;">New balance</td><td style="padding:10px 0;text-align:right;border-top:1px solid #ececec;font-weight:600;color:#cc41b0;">${input.new_balance} points</td></tr>
          <tr><td style="padding:10px 0;color:#6b6b6b;border-top:1px solid #ececec;">Order ID</td><td style="padding:10px 0;text-align:right;font-family:ui-monospace,monospace;font-size:12px;border-top:1px solid #ececec;">${escapeHtml(input.order_id)}</td></tr>
        </table>
        <p style="margin:24px 0 0;font-size:13px;color:#6b6b6b;">
          Points never expire. Use them to reveal contact details (20 points each) on any profile.
        </p>
      </td></tr>
      <tr><td style="padding:18px 28px;background:#fafafa;font-size:12px;color:#6b6b6b;text-align:center;">
        Questions? Reply to this email. We respond within 24 hours.
      </td></tr>
    </table>
  </body>
</html>`.trim();
  const text = [
    `Hi ${input.full_name || 'there'},`,
    '',
    `Thank you for your purchase. Your points have been added to your wallet.`,
    '',
    `Pack:           ${input.pack_name}`,
    `Points added:   +${input.points}`,
    `Amount paid:    Rs. ${input.amount_lkr.toLocaleString()}`,
    `New balance:    ${input.new_balance} points`,
    `Order ID:       ${input.order_id}`,
    '',
    `Points never expire.`,
    `Questions? Reply to this email.`,
  ].join('\n');

  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [input.to],
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      logger.warn({ status: res.status, order_id: input.order_id }, 'resend receipt failed');
      return false;
    }
    return true;
  } catch (err) {
    logger.warn({ err, order_id: input.order_id }, 'resend receipt error');
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
