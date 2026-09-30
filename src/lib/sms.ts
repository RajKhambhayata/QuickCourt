export function isSmsConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
}

/** Sends an SMS using Twilio's Messages API. The destination is always supplied by the server. */
export async function sendVerificationSms(to: string, code: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.log(`[SMS Dev Fallback] SMS credentials not set in .env. Verification OTP for ${to}: ${code}`);
    return;
  }

  const body = new URLSearchParams({
    To: to,
    From: from,
    Body: `Your QuickCourt verification code is ${code}. It expires in 10 minutes. Do not share this code.`,
  });
  const authorization = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const details = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(details?.message || 'SMS provider rejected the message');
  }
}
