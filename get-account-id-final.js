const axios = require('axios');

const JWT_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIwYWVjYjFhZWZhNmY0OGM4Zjg4MzNmNDM2NjNmYTgwMiIsInN1YiI6IjMwMDg1OSIsImN1c3RvbWVyX2NvZGUiOiIzMDAyNzMwNzIifQ.GsfnnpyW23mzdqmWujthvoq8dJDMKwmJ3cbhBK-dhe5mxx7snAM2c23u2HkWE9yMJLwKNJb443ItiKdGoeuc4t-I2DTL3QAQscEjkwS-l5KN01dcxqWzb2pKD3SLZcyq02-oFFx_PkLQxhi9PFv7ta_cI1RsieMQ0K1cHfs9E--92YV8kJd63b-8D_zCHpy7SwLBHpzYXMYJIyq3Z48Kg2HvJBwVOtw86vnZzQwpG_YOEPG9PtyL4ah4eYGFiiyKGFt2Wh3zoeIOlJkj0BcIS1U85-knDS-ZuAj0Rcg-DK2SDx0nNyFugPs6ATwxF0wL_SeHowD3pd2tJ6Q6jFgtxa0608_jToFz_1hz8u4u-KwWYjJWvIu5QJIb8M4rlSVNtAYG1-xfv2IcGHvSAQHpEpQD1dS9lsCZj4Ov1j5j_VfYaqXf_qqnC60XurCIEdxYFSOj0Xd-48NtGztDlIzIa_Q76cAuZYoRp2i8sXWY1scLObcKWl3FjiNY7vhLHHiH';
const CUSTOMER_CODE = '300273072';
const BANK_CODE = '044525104';

async function getAccountId() {
  try {
    console.log('📡 Получаем Account ID...\n');
    console.log(`Customer Code: ${CUSTOMER_CODE}`);
    console.log(`Bank Code: ${BANK_CODE}\n`);

    const res = await axios.get(
      `https://enter.tochka.com/uapi/sbp/v1.0/customer/${CUSTOMER_CODE}/${BANK_CODE}`,
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Accept': 'application/json',
        },
      }
    );

    console.log('✅ Ответ получен:\n');
    console.log(JSON.stringify(res.data, null, 2));

    // Ищем Account ID
    const accountId = 
      res.data?.Data?.AccountList?.[0]?.accountId ||
      res.data?.AccountList?.[0]?.accountId ||
      res.data?.accountId;

    if (accountId) {
      console.log('\n🎉 УСПЕХ! Account ID найден!\n');
      console.log('═══════════════════════════════════════');
      console.log(`TOCHKA_ACCOUNT_ID=${accountId}`);
      console.log('═══════════════════════════════════════\n');
      console.log('📋 Скопируй эту строку и добавь в Railway Variables');
      console.log('🚀 После добавления сделай Redeploy');
    } else {
      console.log('\n⚠️  Account ID не найден в ответе');
      console.log('Полный ответ:', JSON.stringify(res.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.response?.status, error.response?.statusText);
    console.error('Детали:', JSON.stringify(error.response?.data, null, 2));
  }
}

getAccountId();
