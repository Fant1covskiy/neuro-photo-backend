const axios = require('axios');
const crypto = require('crypto');

const TOCHKA_LOGIN = '781720861466-30843';
const TOCHKA_SECRET = '31599ea3-72ed-4136-b362-7e6230ec889a';
const TOCHKA_LEGAL_ID = 'LB0001906034';

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

async function getInfo() {
  console.log('📧 Самый быстрый способ: напиши поддержке\n');
  console.log('═══════════════════════════════════════════════════\n');
  console.log('Кому: api-support@tochka.com');
  console.log('Тема: Account ID для СБП QR генерации\n');
  console.log('Текст письма:\n');
  console.log(`Здравствуйте!

Для интеграции СБП QR генерации нужен Account ID.

Мои данные:
- TOCHKA_LOGIN: ${TOCHKA_LOGIN}
- TOCHKA_MERCHANT_ID: MB0002329815
- TOCHKA_LEGAL_ID: ${TOCHKA_LEGAL_ID}

Также уточните:
- Нужен ли Bearer token для API методов?
- Или можно использовать X-Login и X-Signature?
- Какой endpoint для получения Account ID?

Спасибо!`);
  
  console.log('\n═══════════════════════════════════════════════════\n');
  console.log('💡 Скопируй текст выше и отправь на api-support@tochka.com');
  console.log('⏱️  Обычно отвечают за 1-2 рабочих дня\n');
  console.log('📱 Тем временем твой проект работает с mock QR! ✅');
}

getInfo();
