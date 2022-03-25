const {TransactionType} = require('./constants');
const {PaymentType} = require('./constants');

const supportedTransactionType = {
  US: {
    [PaymentType.Credit]: [TransactionType.Sale, TransactionType.Return, TransactionType.Void, TransactionType.Auth, TransactionType.Capture, TransactionType.CashAdvance],
    [PaymentType.Debit]: [TransactionType.Sale, TransactionType.Return],
    [PaymentType.EBTFood]: [TransactionType.Sale, TransactionType.Return, TransactionType.Balance],
    [PaymentType.Check]: [TransactionType.Verification, TransactionType.Conversion],
    [PaymentType.Cash]: [TransactionType.Sale, TransactionType.Return, TransactionType.Void],
    [PaymentType.Gift]: [TransactionType.Active, TransactionType.Redeem, TransactionType.Refund, TransactionType.Reload, TransactionType.Inquire, TransactionType.Deactivate, TransactionType.Reissue, TransactionType.Void],
    [PaymentType.Loyalty]: [TransactionType.Active, TransactionType.Redeem, TransactionType.Refund, TransactionType.Reload, TransactionType.Inquire, TransactionType.Deactivate, TransactionType.Reissue, TransactionType.Void, TransactionType.AddPoints],
    [PaymentType.Prepaid]: [TransactionType.Sale, TransactionType.Return, TransactionType.Topup],
    [PaymentType.Table]: [TransactionType.Select, TransactionType.Pay]
  },
  CA: {
    [PaymentType.Card]: [TransactionType.Sale, TransactionType.Return, TransactionType.Void, TransactionType.Auth, TransactionType.Capture]
  }
}


class RequestBuilder {
  constructor(country) {
    this._country = country;
    this._p = {};
    this._extra = []
    this.supportedTransactionType = supportedTransactionType[country];
  }

  add(param) {
    this._extra.push(param)
    return this
  }

  addAuthKey(v) {
    this._p['AuthKey'] = v
    return this;
  }

  addPaymentType(v) {
    this._p['PaymentType'] = v
    return this;
  }

  addTransactionType(v) {
    this._p['TransType'] = v
    return this;
  }

  addMerchantId(v) {
    this._p['MerchantId'] = v
    return this;
  }

  addAmount(v) {
    this._p['Amount'] = v
    return this;
  }

  addTip(v) {
    this._p['Tip'] = v
    return this;
  }

  addPoints(v) {
    this._p['Points'] = v
    return this;
  }

  addInvoiceNumber(v){
    this._p['InvNum'] = v
    return this;
  }

  addRefId(v) {
    this._p['RefId'] = v
    return this;
  }

  addAuthCode(authCode) {
    this._p['AuthCode'] = authCode
    return this;
  }

  addRegisterId(registerId) {
    if (registerId && this._p['TPN'])
      delete this._p['TPN']
    this._p['RegisterId'] = registerId
    return this;
  }

  addTPN(tpn) {
    if (tpn && this._p['RegisterId'])
      delete this._p['RegisterId']
    this._p['TPN'] = tpn
    return this;
  }

  addClerkId(v) {
    this._p['ClerkId'] = v
    return this;
  }

  addTableNumber(v) {
    this._p['TableNum'] = v
    return this;
  }

  addTicketNumber(v) {
    this._p['TicketNum'] = v
    return this;
  }

  addCashbackAmount(v) {
    this._p['CashbackAmount'] = v
    return this;
  }

  addCardData(v) {
    this._p['CardData'] = v
    return this;
  }

  addPrintReceipt(v) {
    this._p['PrintReceipt'] = v
    return this
  }

  addFrequency(v) {
    this._p['Frequency'] = v
    return this
  }

  addToken(v) {
    this._p['Token'] = v
    return this
  }

  addSigCapture(v) {
    this._p['SigCapture'] = v
    return this
  }

  addCust1(v) {
    this._p['Cust1'] = v
    return this
  }

  addCust2(v) {
    this._p['Cust2'] = v
    return this
  }

  addCust3(v) {
    this._p['Cust3'] = v
    return this
  }

  addAlert(v) {
    this._p['Alert'] = v
    return this
  }

  addCardType(v) {
    this._p['CardType'] = v
    return this
  }

  addTaxAmount(v) {
    this._p['TaxAmount'] = v
    return this
  }

  addCustRef(v) {
    this._p['CustRef'] = v
    return this
  }

  addLocalTaxFlag(v) {
    this._p['LocalTaxFlag'] = v
    return this
  }

  addNationalTaxAmount(v) {
    this._p['NationalTaxAmount'] = v
    return this
  }

  addDestZipCode(v) {
    this._p['DestZipCode'] = v
    return this
  }

  addCustomerVatReg(v) {
    this._p['CustomerVatReg'] = v
    return this
  }

  addSummaryCommodityCode(v) {
    this._p['SummaryCommodityCode'] = v
    return this
  }

  addFreightAmount(v) {
    this._p['FreightAmount'] = v
    return this
  }

  addDutyAmount(v) {
    this._p['DutyAmount'] = v
    return this
  }

  addShipfromZipCode(v) {
    this._p['ShipfromZipCode'] = v
    return this
  }

  addDestCountryCode(v) {
    this._p['DestCountryCode'] = v
    return this
  }

  addLineItemCount(v) {
    this._p['LineItemCount'] = v
    return this
  }

  addLevel3LineItems(v) {
    this._p['Level3LineItems'] = v
    return this
  }

  addCommodityCode(v) {
    this._p['CommodityCode'] = v
    return this
  }

  addDescription(v) {
    this._p['Description'] = v
    return this
  }

  addProductCode(v) {
    this._p['ProductCode'] = v
    return this
  }

  addQuantity(v) {
    this._p['Quantity'] = v
    return this
  }

  addUnitOfMeasure(v) {
    this._p['UnitOfMeasure'] = v
    return this
  }

  addUnitCost(v) {
    this._p['UnitCost'] = v
    return this
  }

  addVatTaxAmount(v) {
    this._p['VatTaxAmount'] = v
    return this
  }

  addVatTaxRate(v) {
    this._p['VatTaxRate'] = v
    return this
  }

  addDiscountAmount(v) {
    this._p['DiscountAmount'] = v
    return this
  }

  addTotalAmount(v) {
    this._p['TotalAmount'] = v
    return this
  }

  addDiscountRate(v) {
    this._p['DiscountRate'] = v
    return this
  }

  addAltTaxAmount(v) {
    this._p['AltTaxAmount'] = v
    return this
  }

  addAltTaxID(v) {
    this._p['AltTaxID'] = v
    return this
  }

  addTaxTypeApplied(v) {
    this._p['TaxTypeApplied'] = v
    return this
  }

  addExtLineAmount(v) {
    this._p['ExtLineAmount'] = v
    return this
  }

  addDiscountIndicator(v) {
    this._p['DiscountIndicator'] = v
    return this
  }

  addNetGrossIndicator(v) {
    this._p['NetGrossIndicator'] = v
    return this
  }

  addDebitCreditIndicator(v) {
    this._p['DebitCreditIndicator'] = v
    return this
  }

  addQuantityExpIndicator(v) {
    this._p['QuantityExpIndicator'] = v
    return this
  }

  addDiscountRateExp(v) {
    this._p['DiscountRateExp'] = v
    return this
  }

  addHSA_TotalAmount(v) {
    this._p['HSA_TotalAmount'] = v
    return this
  }

  addHSA_RxAmount(v) {
    this._p['HSA_RxAmount'] = v
    return this
  }

  addHSA_VisionAmount(v) {
    this._p['HSA_VisionAmount'] = v
    return this
  }

  addHSA_ClinicAmount(v) {
    this._p['HSA_ClinicAmount'] = v
    return this
  }

  addHSA_DentalAmount(v) {
    this._p['HSA_DentalAmount'] = v
    return this
  }

  addHSA_SKU(v) {
    this._p['HSA_SKU'] = v
    return this
  }

  addMastercardReturnOffline(v) {
    this._p['MastercardReturnOffline'] = v
    return this
  }

  addTransactionID(v) {
    this._p['TransactionID'] = v
    return this
  }

  build() {
    const params = Object.keys(this._p).map(k => this._p[k] !== undefined ? `<${k}>${this._p[k]}</${k}>` : '').join('')
    const extra = this._extra.join('')
    return `<request>${params}${extra}</request>`
  }
}

module.exports = RequestBuilder
