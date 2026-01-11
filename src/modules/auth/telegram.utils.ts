import * as crypto from 'crypto';

export interface TelegramInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
  };
  auth_date: number;
  hash: string;
}

export function validateTelegramWebAppData(
  initData: string,
  botToken: string,
): TelegramInitData | null {
  try {
    const parsed = new URLSearchParams(initData);
    const hash = parsed.get('hash');
    parsed.delete('hash');

    if (!hash) {
      return null;
    }

    const dataCheckArray = Array.from(parsed.entries());
    dataCheckArray.sort((a, b) => a[0].localeCompare(b[0]));
    const dataCheckString = dataCheckArray
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return null;
    }

    const userParam = parsed.get('user');
    const authDate = parsed.get('auth_date');

    if (!userParam || !authDate) {
      return null;
    }

    const user = JSON.parse(userParam);
    
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - parseInt(authDate) > 86400) {
      return null;
    }

    return {
      query_id: parsed.get('query_id') || undefined,
      user,
      auth_date: parseInt(authDate),
      hash,
    };
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return null;
  }
}
