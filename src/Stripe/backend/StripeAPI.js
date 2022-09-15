const StripeSDK = require('stripe')

class StripeAPI {
  constructor(apiKey) {
    this.stripe = StripeSDK(apiKey)
  }
  async preAuth(amount, currency) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: +amount,
      currency: (currency + '').toLowerCase(),
      payment_method_types: ['card'],
      capture_method: 'manual',
    })
    return paymentIntent.client_secret
  }
  async capture(paymentIntentId, amount) {
    return this.stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amount
    })
  }
  async refund(paymentIntentId) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status === 'requires_capture') {
      return this.stripe.paymentIntents.cancel(paymentIntentId, { cancellation_reason: 'requested_by_customer' })
    } else {
      return this.stripe.refunds.create({payment_intent: paymentIntentId})
    }
  }
}
