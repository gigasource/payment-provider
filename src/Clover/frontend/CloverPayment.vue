<template>
  <div class="mb-3">
    <img src="https://files.readme.io/576b2c2-small-clover-logo.d034eaa6.png" style="height: 30px"/>
  </div>

  <form :action="action" method="post" id="payment-form" class="clover-payment-form">
    <div class="form-row top-row">
      <div id="amount" class="rf-aic mb-3">
        <span class="mr-2">Total price: </span>
        <input name="amount" placeholder="Amount" :value="amount" readonly class="amount">
      </div>
    </div>

    <div class="form-row top-row">
      Card information:
    </div>

    <div class="form-row top-row">
      <div id="card-number" class="field card-number"></div>
    </div>

    <div class="form-row">
      <div id="card-date" class="field third-width"></div>
    </div>

    <div class="form-row">
      <div id="card-cvv" class="field third-width"></div>
    </div>

    <div class="form-row">
      <div id="card-postal-code" class="field third-width"></div>
    </div>

    <div id="card-response" role="alert"></div>
    <div class="input-errors" id="card-number-errors" role="alert"></div>
    <div class="input-errors" id="card-date-errors" role="alert"></div>
    <div class="input-errors" id="card-cvv-errors" role="alert"></div>
    <div class="input-errors" id="card-postal-code-errors" role="alert"></div>

    <div class="button-container">
      <button class="btn-submit">Submit Payment</button>
    </div>
  </form>
</template>
<script>
import {injectScript} from '../../payment-provider-utils';

const POLYFILL_URL = 'https://cdn.polyfill.io/v3/polyfill.min.js'
const CLOVER_PROD_SDK = 'https://checkout.clover.com/sdk.js'
const CLOVER_SANDBOX_SDK = 'https://checkout.sandbox.dev.clover.com/sdk.js'

export default {
  name: 'CloverPayment',
  props: {
    production: Boolean,
    action: String,
    amount: Number,
    merchantPublicKey: String
  },
  mounted() {
    injectScript(POLYFILL_URL)
    .catch(console.error)
    .finally(() => {
      injectScript(this.production ? CLOVER_PROD_SDK : CLOVER_SANDBOX_SDK).then(() => {
        this.initCloverPayment()
      }).catch(e => {
        const msg = e.message
        console.error(msg)
        alert(msg)
      })
    })
  },
  computed: {},
  methods: {
    initCloverPayment() {
      const clover = new Clover(this.merchantPublicKey);
      const elements = clover.elements();

      const inputStyle = {
        'border': '1px solid #e0e0e0',
        'border-radius': '6px',
        'width': '20em',
        'font-size': '18px',
        'padding': '6px',
        'margin': '3px',
        'color': '#444444',
        'height': '30px',
      }

      const styles = {
        'card-number input': inputStyle,
        'card-date input': inputStyle,
        'card-cvv input': inputStyle,
        'card-postal-code input': inputStyle,
      };

      const form = document.getElementById('payment-form');
      const cardNumber = elements.create('CARD_NUMBER', styles);
      const cardDate = elements.create('CARD_DATE', styles);
      const cardCvv = elements.create('CARD_CVV', styles);
      const cardPostalCode = elements.create('CARD_POSTAL_CODE', styles);

      cardNumber.mount('#card-number');
      cardDate.mount('#card-date');
      cardCvv.mount('#card-cvv');
      cardPostalCode.mount('#card-postal-code');

      const cardResponse = document.getElementById('card-response');
      const displayCardNumberError = document.getElementById('card-number-errors');
      const displayCardDateError = document.getElementById('card-date-errors');
      const displayCardCvvError = document.getElementById('card-cvv-errors');
      const displayCardPostalCodeError = document.getElementById('card-postal-code-errors');

      const displayError = {
        CARD_CVV: displayCardCvvError,
        CARD_DATE: displayCardDateError,
        CARD_NUMBER: displayCardNumberError,
        CARD_POSTAL_CODE: displayCardPostalCodeError
      }

      // Handle real-time validation errors from the card element
      cardNumber.addEventListener('change', event => console.log(`cardNumber changed ${JSON.stringify(event)}`))
      cardNumber.addEventListener('blur', event => console.log(`cardNumber blur ${JSON.stringify(event)}`))
      cardDate.addEventListener('change', event => console.log(`cardDate changed ${JSON.stringify(event)}`))
      cardDate.addEventListener('blur', event => console.log(`cardDate blur ${JSON.stringify(event)}`))
      cardCvv.addEventListener('change', event => console.log(`cardCvv changed ${JSON.stringify(event)}`))
      cardCvv.addEventListener('blur', event => console.log(`cardCvv blur ${JSON.stringify(event)}`))
      cardPostalCode.addEventListener('change', event =>  console.log(`cardPostalCode change ${JSON.stringify(event)}`))
      cardPostalCode.addEventListener('blur', event =>  console.log(`cardPostalCode blur ${JSON.stringify(event)}`))

      form.addEventListener('submit', e => {
        e.preventDefault();
        // Use the iframe's tokenization method with the user-entered card details
        clover.createToken()
        .then(result => {
          if (result.errors) {
            console.log('result.errors', result.errors)
            Object.keys(result.errors).forEach(key => {
              const value = result.errors[key]
              displayError[key].innerText = value
            })
          } else {
            this.cloverTokenHandler(result.token);
          }
        });
      });
    },
    cloverTokenHandler(token) {
      // Insert the token ID into the form so it gets submitted to the server
      const form = document.getElementById('payment-form');
      const hiddenInput = document.createElement('input');
      hiddenInput.setAttribute('type', 'hidden');
      hiddenInput.setAttribute('name', 'cloverToken');
      hiddenInput.setAttribute('value', token);
      form.appendChild(hiddenInput);
      form.submit();
    }
  }
}
</script>
<style scoped lang="scss">
.clover-payment-form {
  .amount {
    font-size: 18px;
    font-weight: bold;
    pointer-events: none;
  }

  .input-errors {
    height: 20px;
    color: #000;
  }

  .btn-cancel {
    font-family: Arial;
    font-size: 13px;
    line-height: 28px;
    display: inline-block;
    margin-right: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 0 12px;
    background: #e0e0e0;
    color: #444;
    cursor: pointer;
    height: 28px;
  }

  .btn-submit {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 6px 12px;
    background: #2979ff;
    color: #fff;
    cursor: pointer;
  }

  .input-errors {
    color: #f55656;
    font-size: small;
    line-height: 20px;
  }

  :deep {
    #card-number, #card-date, #card-cvv, #card-postal-code {
      height: 36px !important;
    }
  }
}
</style>
