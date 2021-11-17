const { nanoid } = require('nanoid');

async function createPayment(client, payload) {
  const idempotencyKey = payload.idempotencyKey || nanoid();
  const payment = {
    idempotencyKey,
    locationId: payload.locationId,
    sourceId: payload.sourceId,
    autocomplete: payload.autocomplete,
    amountMoney: payload.amountMoney,
    // {
    //   amount: '100' /*the expected amount is in cents, meaning this is $1.00.*/,
    //   currency: 'USD',
    // },
  };

  const response = await client.paymentsApi.createPayment(payment);
  if (response && response.body && response.body.payment)
    response.body.payment.idempotencyKey = idempotencyKey
  return response
}

async function cancelPayment(client, paymentId) {
  return await client.paymentsApi.cancelPayment(paymentId)
}

async function completePayment(client, paymentId) {
  return await client.paymentsApi.completePayment(paymentId, {})
}

async function refund(client, {paymentId, idempotencyKey, amountMoney}) {
  return await client.refundsApi.refundPayment({paymentId, idempotencyKey, amountMoney})
}

module.exports = {
  createPayment,
  cancelPayment,
  completePayment,
  refund
}
