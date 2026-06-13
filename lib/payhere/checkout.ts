import { createHash } from 'node:crypto';

const SANDBOX_CHECKOUT = 'https://sandbox.payhere.lk/pay/checkout';
const LIVE_CHECKOUT = 'https://www.payhere.lk/pay/checkout';

export interface PayhereCheckoutInput {
  merchantId: string;
  merchantSecret: string;
  mode: 'sandbox' | 'live';
  orderId: string;
  amountLkr: number;
  itemDescription: string;
  customerEmail: string;
  customerPhone: string;
  customerFirstName: string;
  customerLastName: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface PayhereCheckoutForm {
  action: string;
  fields: Record<string, string>;
}

/**
 * Build the form fields PayHere expects on its hosted checkout page.
 * Server-side only — uses the merchant secret to compute the upfront hash.
 *
 * Signature spec:
 *   md5(merchantId + orderId + amount + currency + md5(merchantSecret).toUpperCase()).toUpperCase()
 */
export function buildCheckoutForm(input: PayhereCheckoutInput): PayhereCheckoutForm {
  const amount = input.amountLkr.toFixed(2);
  const currency = 'LKR';
  const secretHash = createHash('md5')
    .update(input.merchantSecret)
    .digest('hex')
    .toUpperCase();
  const hash = createHash('md5')
    .update(input.merchantId + input.orderId + amount + currency + secretHash)
    .digest('hex')
    .toUpperCase();

  return {
    action: input.mode === 'live' ? LIVE_CHECKOUT : SANDBOX_CHECKOUT,
    fields: {
      merchant_id: input.merchantId,
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
      notify_url: input.notifyUrl,
      order_id: input.orderId,
      items: input.itemDescription,
      currency,
      amount,
      first_name: input.customerFirstName,
      last_name: input.customerLastName,
      email: input.customerEmail,
      phone: input.customerPhone,
      address: '',
      city: '',
      country: 'Sri Lanka',
      hash,
    },
  };
}
