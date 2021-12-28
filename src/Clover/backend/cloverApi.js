const axios = require('axios');
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

async function refundPayment(accessToken, payload) {
  // todo
}

module.exports = {
  completePayment,
  refundPayment
}
