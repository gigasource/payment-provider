const StripeSDK = require('stripe')
const _ = require('lodash')

/** The wrapper using Destination-Charges: https://stripe.com/docs/connect/destination-charges  */
class StripeAPI {
  constructor(apiKey, options) {
    this.stripe = StripeSDK(apiKey)
    this.options = options
  }

  async calcAppFee(amount) {
    let appFeeAmount = this.options.application_fee_amount
    let appFee;
    if (typeof appFeeAmount === 'string') {
      if (appFeeAmount.indexOf('%') > 0) {  // percentage
        appFeeAmount = Number(appFeeAmount.replace('%', ''))
        appFee = _.round(+amount * appFeeAmount / 100, 0)
      } else { // fixed value
        appFee = Number(appFeeAmount)
      }
    }
    return appFee
  }

  async preAuth(amount, currency) {
    amount = Number(amount)

    const payload = {
      amount: amount,
      currency: (currency + '').toLowerCase(),
      payment_method_types: ['card'],
      capture_method: 'manual',
    }

    if (this.options && this.options.stripeAccount) {
      payload.on_behalf_of = this.options.stripeAccount;
      payload.application_fee_amount = this.calcAppFee(amount);
      payload.transfer_data = {
        destination: this.options.stripeAccount,
      }
    }
    return await this.stripe.paymentIntents.create(payload)
  }

  async capture(paymentIntentId) {
    return this.stripe.paymentIntents.capture(paymentIntentId)
  }

  async refund(paymentIntentId) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status === 'requires_capture') { // being hold -> cancel
      return this.stripe.paymentIntents.cancel(paymentIntentId, {cancellation_reason: 'requested_by_customer'})
    } else { // captured -> refund
      return this.stripe.refunds.create({payment_intent: paymentIntentId})
      // if (this.options && this.options.stripeAccount) {
      //   return this.stripe.refunds.create({payment_intent: paymentIntentId}, {stripeAccount: this.options.stripeAccount})
      // } else {
      //   return this.stripe.refunds.create({payment_intent: paymentIntentId})
      // }
    }
  }
}

module.exports = StripeAPI
