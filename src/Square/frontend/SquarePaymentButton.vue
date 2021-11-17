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
export default {
  name: 'SquarePaymentButton',
  props: {
    appId: String,
    locationId: String,
  },
  mounted() {
    const sdkHref = 'https://sandbox.web.squarecdn.com/v1/square.js'
    let script = document.querySelector(`script[src="${sdkHref}"]`);
    if (!script) {
      console.log('Loading SquareSdk...');
      script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = sdkHref;
      script.onload = () => {
        console.log('SquareSdk loaded.')
        this.sdkLoaded = true
        this.initSquareCardButton()
      }
      document.body.appendChild(script)
    } else {
      this.sdkLoaded = true
      this.initSquareCardButton()
    }
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
        console.error('init square card button failed', e)
      }
    },
    async getToken() {
      return (await this.__card.tokenize()).token
    }
  }
}
</script>
