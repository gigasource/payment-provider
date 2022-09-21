const StripeSDK = require('stripe')

class StripeAPI {
  constructor(apiKey, options) {
    this.stripe = StripeSDK(apiKey)
    this.options = options
  }

  async preAuth(amount, currency) {
    const payload = {
      amount: +amount,
      currency: (currency + '').toLowerCase(),
      payment_method_types: ['card'],
      capture_method: 'manual',
    }

    if (this.options && this.options.stripeAccount) {
      payload.application_fee_amount = this.options.application_fee_amount;
      payload.transfer_data = {
        destination: this.options.stripeAccount,
      }
    }
    const paymentIntent = await this.stripe.paymentIntents.create(payload)
    return paymentIntent
  }

  async capture(paymentIntentId) {
    return this.stripe.paymentIntents.capture(paymentIntentId)
  }

  async refund(paymentIntentId) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status === 'requires_capture') { // being hold -> cancel
      return this.stripe.paymentIntents.cancel(paymentIntentId, {cancellation_reason: 'requested_by_customer'})
    } else { // captured -> refund
      if (this.options && this.options.stripeAccount) {
        return this.stripe.refunds.create({payment_intent: paymentIntentId}, {stripeAccount: this.options.stripeAccount})
      } else {
        return this.stripe.refunds.create({payment_intent: paymentIntentId})
      }
    }
  }
}

module.exports = StripeAPI
