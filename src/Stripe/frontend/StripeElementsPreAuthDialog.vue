<template>
  <g-dialog v-model="visible" eager persistent>
    <div class="bg-white" style="min-width: 300px; min-height: 300px; margin: 0 auto; padding: 36px; border-radius: 6px">
      <div style="height: 30px" class="row-flex justify-end">
        <g-icon @click="hide" class="clickable">close</g-icon>
      </div>
      <form id="payment-form" @submit="handleSubmit">
        <div id="payment-element" style="min-height: 200px;">
          <!--Stripe.js injects the Payment Element-->
        </div>
        <div v-if="scriptInjecting" class="ta-center">Loading script...</div>
        <div v-if="initializing" class="ta-center">Initializing...</div>
        <div class="row-flex justify-center mt-4">
          <button id="submit" class="w-100" style="background-color: #2979FF; border: none; height: 30px; border-radius: 15px; color: #fff;">
            <div class="spinner hidden" id="spinner"/>
            <span id="button-text">Pay now</span>
          </button>
        </div>
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
    publicKey: String,
    storeId: String,
    orderId: String,
    amount: Number,
    currency: String
  },
  data() {
    return {
      visible: false,
      scriptInjecting: false,
      initializing: false,
      initialized: false
    }
  },
  watch: {
    visible() {
      if (this.visible && !this.initialized) {
        this.scriptInjecting = true;
        injectScript('https://js.stripe.com/v3/').then(() => {
          this.scriptInjecting = false
          this.initialize()
        }).catch(e => {
          this.scriptInjecting = false
          const msg = `Failed to load Stripe Sdk with error ${e.message}`
          console.error(msg)
          alert(msg)
        })
      }
    }
  },
  methods: {
    async initialize() {
      if (!window.Stripe) {
        console.error('Stripe SDK is not initialized')
        return
      }

      this.initializing = true
      this.stripe = Stripe(this.publicKey)

      const {data} = await axios.post(this.preAuthUrl, {
        storeId: this.storeId,
        orderId: this.orderId,
        amount: this.amount,
        currency: this.currency
      })
      const {clientSecret} = data
      const appearance = {theme: 'stripe'}
      this.elements = this.stripe.elements({appearance, clientSecret});
      const paymentElement = this.elements.create('payment')
      paymentElement.mount('#payment-element')

      this.initializing = false
      this.initialized = true
    },
    async handleSubmit(e) {
      e.preventDefault()
      this.setLoading(true)

      // https://stripe.com/docs/js/payment_intents/confirm_payment#confirm_payment_intent-options-redirect
      const {error, paymentIntent} = await this.stripe.confirmPayment({
        elements: this.elements,
        redirect: 'if_required'
      })

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          this.showMessage(error.message)
        } else {
          this.showMessage('An unexpected error occurred.')
        }
      } else {
        this.$emit('onApprove', paymentIntent)
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
      this.visible = true
    },
    hide() {
      this.visible = false
    }
  }
}
</script>
