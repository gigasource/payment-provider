<template>
  <div v-if="selfHost" :id="containerId">
    <div v-if="!sdkLoaded">
      <slot></slot>
    </div>
    <div v-if="error">
      <slot name="error" v-bind:error="error"></slot>
    </div>
  </div>
</template>
<script>
import {injectScript} from '../../payment-provider-utils';
  // https://developer.paypal.com/docs/checkout/reference/customize-sdk/#query-parameters
  export default {
    name: 'PayPalSmartButton',
    components: {

    },
    props: {
      // CONTAINER ------
      selfHost: Boolean,
      hostId: String,

      // order items
      orderInfo: Object,

      // query parameters
      clientId: String,
      merchantId: String,
      currency: String,
      intent: String,
      commit: Boolean,
      vault: Boolean,
      disableFunding: String,
      disableCard: String,
      integrationDate: String,
      debug: Boolean,
      buyerCountry: String,
      locale: String,

      // behavior
      /**
       * If useCustomCreateOrder is set, onCreateOrder event will be emit
       * else, PayPal built-in function actions.order.create will be call with provided orderInfo
       *
       * Use case: Set this value to true in-case you want to create order by server side code
       */
      useCustomCreateOrder: Boolean,

      /**
       * If useCustomCaptureOrder is set, onApprove event will be emit with data object contain transaction information
       * else, current transaction will be captured
       */
      useCustomCaptureOrder: Boolean,
    },
    data: function () {
      return {
        sdkLoaded: false,
        containerId: this.selfHost ? `ppsb-${new Date().getTime()}` : this.hostId,
        error: null
      }
    },
    mounted() {
      const sdkHref = this.buildSdkHref();
      injectScript(sdkHref).then(() => this.sdkLoaded = true).catch((e) => {
        console.error(e)
        alert('Error: Failed to load Paypal sdk')
      })
    },
    watch: {
      orderInfo() {
        this.updatePayPalItemsDebounce()
      },
      sdkLoaded() {
        if (this.sdkLoaded) {
          this.updatePayPalItems()
        }
      }
    },
    created() {
      this.updatePayPalItemsDebounce = _.debounce(this.updatePayPalItems, 200)
    },
    methods: {
      buildSdkHref() {
        const endpoint = 'https://www.paypal.com/sdk/js';
        const qry = {};
        if (!this.clientId) {
          console.error('Missing client id');
          return;
        }
        qry['client-id'] = this.clientId;
        this.merchantId && (qry['merchant-id'] = this.merchantId);
        this.currency && this.currency !== "USD" && (qry.currency = this.currency); // default: USD
        this.intent && this.intent !== "capture" && (qry.intent = this.intent); // default: "capture"
        this.commit === false && (qry.commit = this.commit);
        this.vault === false && (qry.vault = this.vault); // default: false
        this.disableFunding && (qry['disable-funding'] = this.disableFunding);
        this.disableCard && (qry['disable-card'] = this.disableCard);
        this.integrationDate && (qry['integration-date'] = this.integrationDate);
        //this.debug && (qry.debug = this.debug);
        this.buyerCountry && (qry['buyer-country'] = this.buyerCountry);
        this.locale && (qry.locale = this.locale);
        const query = Object.keys(qry).map(prop => `${prop}=${qry[prop]}`).join('&');
        const href = `${endpoint}?${query}`;
        this.debug && console.log(href);
        return href
      },
      updatePayPalItems() {
        if (!this.sdkLoaded || !this.orderInfo) {
          console.log('sdk is not loaded or order info is missing');
          return
        }

        const _this = this;
        let container = document.getElementById(_this.containerId);
        if (!container) {
          console.log('PayPal container missing')
        } else {
          container.innerText = '';

          try {
            const btnConfig = {
              locale: 'en_US',
              style: {
                size: 'responsive',
                color:  'gold',
                shape:  'pill',
                label:  'pay',
                height: 40
              },
              createOrder: async function (data, actions) {
                if (_this.useCustomCreateOrder) {
                  _this.$emit('onCreateOrder', data)
                } else {
                  return actions.order.create(_this.orderInfo);
                }
              },
              onApprove: async function (data, actions) {
                if (_this.useCustomCaptureOrder) {
                  _this.debug && console.log('custom capture on approve')
                  _this.$emit('onApprove', data)
                } else {
                  _this.debug && console.log('immediately capture on approve')
                  return actions.order.capture().then(function(details) {
                    _this.$emit('onCaptured', details)
                  });
                }
              }
            }

            paypal.Buttons(btnConfig).render(`#${this.containerId}`);
          } catch (e) {
            console.log('paypal', paypal)
            console.error(e)
            this.error = e.message
          }
        }
      }
    }
  }
</script>
