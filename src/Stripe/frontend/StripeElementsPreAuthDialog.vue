<template>
  <g-dialog v-model={stripePaymentVisible} fullscreen eager persistent>
    <div class="w-100 h-100 bg-white">
      <div style="height: 30px" class="row-flex justify-end">
        <g-icon @click="hide">close</g-icon>
      </div>
      <form id="payment-form" @submit="handleSubmit">
        <div id="payment-element">
          <!--Stripe.js injects the Payment Element-->
        </div>
        <button id="submit">
          <div class="spinner hidden" id="spinner"/>
          <span id="button-text">Pay now</span>
        </button>
        <div id="payment-message" class="hidden"></div>
      </form>
    </div>
  </g-dialog>
</template>
<script>
import {injectScript} from '../../payment-provider-utils';
import axios from 'axios';

export default {
  props: {
    preAuthUrl: String,
    receiptPageUrl: String,
    storeId: String,
    orderId: String,
    amount: Number,
    currency: String
  },
  data() {
    return {
      stripePaymentVisible: false
    }
  },
  mounted() {
    injectScript('https://js.stripe.com/v3/').then(() => {
      this.initialize()
    }).catch(e => {
      const msg = `Failed to load Stripe Sdk with error ${e.message}`
      console.error(msg)
      alert(msg)
    })
  },
  methods: {
    async initialize() {
      const {data} = await axios.post(this.preAuthUrl, {
        storeId: this.storeId,
        orderId: this.orderId,
        amount: this.amount,
        currency: this.currency
      })
      const {clientSecret} = data
      const appearance = {theme: 'stripe'}
      this.elements = stripe.elements({appearance, clientSecret});
      const paymentElement = elements.create('payment')
      paymentElement.mount('#payment-element')
    },
    async handleSubmit(e) {
      e.preventDefault()
      this.setLoading(true)

      const {error} = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: this.receiptPageUrl
        }
      })

      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`. For some payment methods like iDEAL, your customer will
      // be redirected to an intermediate site first to authorize the payment, then
      // redirected to the `return_url`.
      if (error.type === 'card_error' || error.type === 'validation_error') {
        this.showMessage(error.message)
      } else {
        this.showMessage('An unexpected error occurred.')
      }

      this.setLoading(false)
    },
    showMessage(messageText) {
      const messageContainer = document.querySelector('#payment-message');

      messageContainer.classList.remove('hidden');
      messageContainer.textContent = messageText;

      setTimeout(function () {
        messageContainer.classList.add('hidden');
        messageText.textContent = '';
      }, 4000);
    },
    setLoading(isLoading) {
      if (isLoading) {
        // Disable the button and show a spinner
        document.querySelector("#submit").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
      } else {
        document.querySelector("#submit").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
      }
    },
    show() {
      this.stripePaymentVisible = true
    },
    hide() {
      this.stripePaymentVisible = false
    }
  }
}
</script>
