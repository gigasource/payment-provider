import axios from 'axios';
const { nanoid } = require('nanoid');

async function completePayment(accessToken, payload) {
  const idempotencyKey = payload.idempotencyKey || nanoid();

  await axios.post('https://scl-sandbox.dev.clover.com/v1/charges', {
    "amount": payload.amount,
    "currency": "usd",
    "source": payload.source
  }, {
    headers: {
      'accept': 'application/json',
      'authorization': `Bearer ${accessToken}`,
      'idempotency-key ${idempotencyKey}': '',
      'content-type': 'application/json',
    }
  })
}
