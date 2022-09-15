<template>
  <div>
    <form id="payment-form">
      <div id="card-container"></div>
    </form>
    <div v-if="!sdkLoaded">
      <slot name="sdkLoading"/>
    </div>
    <slot v-bind:getToken="getToken"/>
  </div>
</template>
<script>
import {injectScript} from '../../payment-provider-utils';
export default {
  name: 'SquarePaymentButton',
  props: {
    appId: String,
    locationId: String,
    production: Boolean
  },
  mounted() {
    const sdkSrc = this.production ?'https://web.squarecdn.com/v1/square.js' : 'https://sandbox.web.squarecdn.com/v1/square.js'
    injectScript(sdkSrc).then(() => {
      this.sdkLoaded = true
      this.initSquareCardButton()
    }).catch(e => {
      const msg = `load square sdk failed with error ${e.message}`
      console.error(msg)
      alert(msg)
    })
  },
  data() {
    return {
      sdkLoaded: false,
    }
  },
  methods: {
    async initSquareCardButton() {
      try {
        console.log('Init square payments', this.appId, this.locationId)
        const payments = window.Square.payments(this.appId, this.locationId);
        this.__card = await payments.card();
        await this.__card.attach('#card-container')
      } catch (e) {
        const msg = `init square card button failed with error ${e.message}`
        console.error(msg)
        alert(msg)
      }
    },
    async getToken() {
      return (await this.__card.tokenize()).token
    }
  }
}
</script>
