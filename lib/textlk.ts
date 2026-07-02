import { logger } from '@/lib/logger';

const TEXTLK_ENDPOINT = 'https://app.text.lk/api/v3/sms/send';

interface SendTextLKSMSParams {
  /** Canonical Text.lk recipient format, e.g. "94771234567" (no leading +). */
  recipient: string;
  message: string;
}

interface TextLKSendResult {
  messageId?: string;
}

interface TextLKResponseShape {
  status?: string;
  success?: boolean;
  data?: { uid?: string };
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return '***';
  return `${phone.slice(0, 4)}***${phone.slice(-2)}`;
}

/**
 * Send an SMS via Text.lk. Throws `Error('TEXTLK_NOT_CONFIGURED')` if the
 * server env vars are missing, or `Error('TEXTLK_SEND_FAILED')` on any
 * transport/API failure. Never logs the API token or the message body.
 */
export async function sendTextLKSMS({
  recipient,
  message,
}: SendTextLKSMSParams): Promise<TextLKSendResult> {
  const token = process.env.TEXTLK_API_TOKEN;
  const senderId =
    process.env.TEXTLK_SENDER_ID || (process.env.NODE_ENV !== 'production' ? 'TextLKDemo' : undefined);

  if (!token || !senderId) {
    logger.error({ recipient: maskPhone(recipient) }, 'textlk: missing TEXTLK_API_TOKEN/TEXTLK_SENDER_ID');
    throw new Error('TEXTLK_NOT_CONFIGURED');
  }

  let response: Response;
  try {
    response = await fetch(TEXTLK_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        recipient,
        sender_id: senderId,
        type: 'plain',
        message,
      }),
    });
  } catch (err) {
    logger.error({ recipient: maskPhone(recipient), err: String(err) }, 'textlk: request failed');
    throw new Error('TEXTLK_SEND_FAILED');
  }

  const data = (await response.json().catch(() => null)) as TextLKResponseShape | null;

  if (!response.ok || data?.status === 'error' || data?.success === false) {
    logger.error(
      { recipient: maskPhone(recipient), httpStatus: response.status, textlkStatus: data?.status },
      'textlk: send failed',
    );
    throw new Error('TEXTLK_SEND_FAILED');
  }

  const messageId = typeof data?.data?.uid === 'string' ? data.data.uid : undefined;
  logger.info(
    { recipient: maskPhone(recipient), httpStatus: response.status, messageId },
    'textlk: sms sent',
  );
  return { messageId };
}
