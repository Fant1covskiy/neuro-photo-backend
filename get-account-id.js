const axios = require('axios');
const crypto = require('crypto');

const TOCHKA_LOGIN = '781720861466-30843';
const TOCHKA_SECRET = '31599ea3-72ed-4136-b362-7e6230ec889a';
const TOCHKA_MERCHANT_ID = 'MB0002329815';
const TOCHKA_LEGAL_ID = 'LB0001906034';
const BANK_CODE = '044525104';

function sign(payload) {
  const flat = {};
  
  Object.keys(payload).sort().forEach((key) => {
    const value = payload[key];
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      flat[key] = value.join(',');
    } else if (typeof value === 'object') {
      flat[key] = JSON.stringify(value);
    } else {
      flat[key] = String(value);
    }
  });

  const str = Object.keys(flat)
    .sort()
    .map((k) => `${k}=${flat[k]}`)
    .join('&');

  const hmac = crypto.createHmac('sha256', TOCHKA_SECRET);
  hmac.update(str);
  return hmac.digest('hex');
}

async function getAccountId() {
  try {
    // Вариант 1: Прямой запрос через Legal ID
    console.log('📡 Попытка 1: Через Legal ID...');
    
    const params1 = {
      legalId: TOCHKA_LEGAL_ID,
    };
    
    const signature1 = sign(params1);
    
    try {
      const res1 = await axios.get(
        'https://api.tochka.com/sbp/v1.0/merchant/accounts',
        {
          params: params1,
          headers: {
            'X-Login': TOCHKA_LOGIN,
            'X-Signature': signature1,
          },
        }
      );
      
      console.log('✅ Успех! Ответ:', res1.data);
      const accountId = res1.data.accounts?.[0]?.accountId || res1.data[0]?.accountId;
      
      if (accountId) {
        console.log('\n🎉 Account ID найден:', accountId);
        console.log('\n📋 Добавь в Railway Variables:');
        console.log(`TOCHKA_ACCOUNT_ID=${accountId}`);
        return;
      }
    } catch (e) {
      console.log('❌ Попытка 1 не сработала:', e.response?.status, e.response?.data);
    }

    // Вариант 2: Через Merchant ID
    console.log('\n📡 Попытка 2: Через Merchant ID...');
    
    const params2 = {
      merchantId: TOCHKA_MERCHANT_ID,
    };
    
    const signature2 = sign(params2);
    
    try {
      const res2 = await axios.get(
        'https://api.tochka.com/sbp/v1.0/merchant/info',
        {
          params: params2,
          headers: {
            'X-Login': TOCHKA_LOGIN,
            'X-Signature': signature2,
          },
        }
      );
      
      console.log('✅ Успех! Ответ:', res2.data);
      const accountId = res2.data.accountId || res2.data.accounts?.[0]?.accountId;
      
      if (accountId) {
        console.log('\n🎉 Account ID найден:', accountId);
        console.log('\n📋 Добавь в Railway Variables:');
        console.log(`TOCHKA_ACCOUNT_ID=${accountId}`);
        return;
      }
    } catch (e) {
      console.log('❌ Попытка 2 не сработала:', e.response?.status, e.response?.data);
    }

    // Вариант 3: Напрямую спроси у поддержки
    console.log('\n⚠️ API методы не работают.');
    console.log('📧 Отправь поддержке:');
    console.log(`
Здравствуйте!

Не могу получить Account ID через API.
Мои данные:
- TOCHKA_LOGIN: ${TOCHKA_LOGIN}
- TOCHKA_MERCHANT_ID: ${TOCHKA_MERCHANT_ID}
- TOCHKA_LEGAL_ID: ${TOCHKA_LEGAL_ID}

Можете предоставить Account ID для генерации СБП QR?

Спасибо!
    `);

  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
  }
}

getAccountId();
