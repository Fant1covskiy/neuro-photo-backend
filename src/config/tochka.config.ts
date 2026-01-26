export const tochkaConfig = {
  clientId: process.env.TOCHKA_CLIENT_ID || '',
  clientSecret: process.env.TOCHKA_SECRET || '',
  apiUrl: process.env.TOCHKA_API_URL || 'https://api.tochka.com/api/v1',
  login: process.env.TOCHKA_LOGIN || '',
  secret: process.env.TOCHKA_SECRET || '',
  merchantId: process.env.TOCHKA_MERCHANT_ID || '',
  accountId: process.env.TOCHKA_ACCOUNT_ID || '',
  legalId: process.env.TOCHKA_LEGAL_ID || '',
  returnUrl: process.env.TOCHKA_RETURN_URL || '',
};
