<script>
import {ref} from 'vue';
import dayjs from 'dayjs';
import axios from 'axios';

// Resources:
// https://developer.nuvei.com/node/325/#4.3-hosted-pages-in-an-iframe
// https://www.devglan.com/online-tools/hmac-sha256-online

// Recommend
// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
// https://helpdesk.nuvei.com/doku.php?id=developer:integration_docs:testing-guide

// Questions
// How to Pre-authorize payment
// How to Capture payment

export default {
  name: 'NuveiPreAuthHppDialog',
  props: {
    preAuthUrl: String,
    terminalId: String,
    currencySymbol: String,
    orderId: String,
    amount: Number,
    storeId: String,
    cardHolderName: String,
    receiptPageUrl: String,
    getHashUrl: String,
  },
  setup(props, ctx) {
    const nuveiIframeUrl = ref()
    const nuveiPaymentVisible = ref(false)

    const hideNuveiPayment = () => {
      nuveiPaymentVisible.value = false
      nuveiIframeUrl.value = ''
    }

    const showNuveiPayment = async () => {
      const dateTime = dayjs().format('DD-MM-YYYY:HH:mm:ss:SSS');
      const hashInput = [
        props.orderId,
        props.amount,
        dateTime,
        props.receiptPageUrl,
      ].join(':');

      let hash;
      try {
        const response = await axios.get(`${props.getHashUrl}${hashInput}`);
        hash = response.data
      } catch (e) {
        throw new Error(`Failed to generate hash: ${e.message}`)
      }

      const qryObj = {
        TERMINALID: props.terminalId,
        CURRENCY: props.currencySymbol || 'CAD',
        ORDERID: props.orderId,
        AMOUNT: props.amount,
        DATETIME: dateTime,
        CARDHOLDERNAME: props.cardHolderName || '',
        RECEIPTPAGEURL: props.receiptPageUrl,
        HASH: hash,
        // custom query will be send to receipt page url
        STOREID: props.storeId, // for querying payment for which store
      };
      const qryStr = Object.keys(qryObj).map(k => `${k}=${qryObj[k]}`).join('&');
      nuveiIframeUrl.value = `${props.preAuthUrl}?INIFRAME&${qryStr}`;
      nuveiPaymentVisible.value = true
    }

    const renderFn = () =>
      <g-dialog v-model={nuveiPaymentVisible.value} fullscreen eager persistent>
        <div class="w-100 h-100 bg-white">
          <div style="height: 30px" class="row-flex justify-end">
            <g-icon onClick={hideNuveiPayment}>close</g-icon>
          </div>
          <iframe
              style="width: 100%; height: calc(100% - 40px); border: none;"
              src={nuveiIframeUrl.value}
              allowpaymentrequest/>
        </div>
      </g-dialog>

    return {
      hideNuveiPayment,
      showNuveiPayment,
      renderFn
    }
  },
  render() {
    return this.renderFn()
  }
}
</script>
