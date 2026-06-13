import { createHash } from 'node:crypto';

export interface PayhereWebhookPayload {
  merchant_id: string;
  order_id: string;
  payment_id?: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
}

/**
 * Verify PayHere webhook signature.
 * Spec:
 *   md5(
 *     merchant_id + order_id + payhere_amount + payhere_currency + status_code
 *     + md5(merchant_secret).toUpperCase()
 *   ).toUpperCase()
 */
export function verifyPayhereSignature(
  payload: PayhereWebhookPayload,
  merchantSecret: string,
): boolean {
  const secretHash = createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const expected = createHash('md5')
    .update(
      payload.merchant_id +
        payload.order_id +
        payload.payhere_amount +
        payload.payhere_currency +
        payload.status_code +
        secretHash,
    )
    .digest('hex')
    .toUpperCase();
  return expected === payload.md5sig.toUpperCase();
}

export const PAYHERE_STATUS = {
  SUCCESS: '2',
  PENDING: '0',
  CANCELLED: '-1',
  FAILED: '-2',
  CHARGEDBACK: '-3',
} as const;

export function payhereStatusFromCode(code: string): 'success' | 'pending' | 'failed' | 'refunded' {
  if (code === PAYHERE_STATUS.SUCCESS) return 'success';
  if (code === PAYHERE_STATUS.PENDING) return 'pending';
  if (code === PAYHERE_STATUS.CHARGEDBACK) return 'refunded';
  return 'failed';
}
