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
export default {
  name: 'CloverPayment',
  props: {
    production: Boolean,
    action: String,
    amount: Number,
  },
  data: function () {
    return {
      polyFillLoaded: false,
      sdkLoaded: false
    }
  },
  mounted() {
    const polyFillHref = 'https://cdn.polyfill.io/v3/polyfill.min.js';
    let polyFillScript = document.querySelector(`script[src="${polyFillHref}"]`);
    if (!polyFillHref) {
      console.log('loading polyfill...')
      polyFillScript = document.createElement('script');
      polyFillScript.type = 'text/javascript';
      polyFillScript.src = polyFillHref;
      script.onload(() => {
        console.log('polyfill loaded...')
        this.polyFillLoaded = true
        this.initCloverPayment()
      })
    }

    const sdkHref = this.production ? 'https://checkout.clover.com/sdk.js' : 'https://checkout.sandbox.dev.clover.com/sdk.js'
    let script = document.querySelector(`script[src="${sdkHref}"]`);
    if (!script) {
      console.log('Loading CloverSDK...');
      script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = sdkHref;
      script.onload = () => {
        console.log('CloverSDK loaded.')
        this.sdkLoaded = true
        this.initCloverPayment()
      }
      document.body.appendChild(script)
    }

    if (script && polyFillScript) {
      this.initCloverPayment()
    }
  },
  computed: {},
  methods: {
    initCloverPayment() {
      const clover = new Clover('39c7b87101f44739c823362203d21f89');
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
      cardNumber.addEventListener('change', function(event) {
        console.log(`cardNumber changed ${JSON.stringify(event)}`);
      });

      cardNumber.addEventListener('blur', function(event) {
        console.log(`cardNumber blur ${JSON.stringify(event)}`);
      });

      cardDate.addEventListener('change', function(event) {
        console.log(`cardDate changed ${JSON.stringify(event)}`);
      });

      cardDate.addEventListener('blur', function(event) {
        console.log(`cardDate blur ${JSON.stringify(event)}`);
      });

      cardCvv.addEventListener('change', function(event) {
        console.log(`cardCvv changed ${JSON.stringify(event)}`);
      });

      cardCvv.addEventListener('blur', function(event) {
        console.log(`cardCvv blur ${JSON.stringify(event)}`);
      });

      cardPostalCode.addEventListener('change', function(event) {
        console.log(`cardPostalCode changed ${JSON.stringify(event)}`);
      });

      cardPostalCode.addEventListener('blur', function(event) {
        console.log(`cardPostalCode blur ${JSON.stringify(event)}`);
      });



      form.addEventListener('submit', function(event) {
        event.preventDefault();
        // Use the iframe's tokenization method with the user-entered card details
        clover.createToken()
        .then(function(result) {
          if (result.errors) {
            console.log('result.errors', result.errors)
            Object.keys(result.errors).forEach(function (key) {
              const value = result.errors[key];
              debugger
              displayError[key].innerText = value;
            });
          } else {
            cloverTokenHandler(result.token);
          }
        });
      });
    },
    cloverTokenHandler(token) {
      // Insert the token ID into the form so it gets submitted to the server
      var form = document.getElementById('payment-form');
      var hiddenInput = document.createElement('input');
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
