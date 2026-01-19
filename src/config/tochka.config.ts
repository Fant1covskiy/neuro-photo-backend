export const tochkaConfig = {
  login: process.env.TOCHKA_LOGIN as string,
  secret: process.env.TOCHKA_SECRET as string,
  apiUrl: process.env.TOCHKA_API_URL as string,
  merchantId: process.env.TOCHKA_MERCHANT_ID as string,
  accountId: process.env.TOCHKA_ACCOUNT_ID as string,
  returnUrl: process.env.TOCHKA_RETURN_URL as string | undefined,
};
