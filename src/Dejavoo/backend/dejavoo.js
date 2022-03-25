const axios = require('axios');
const {AxiosError} = require('axios');
const {InputType, PaymentType, TransactionType, PrintReceipt, SignatureCapture, Frequency} = require('./constants')
const XmpParser = require('./XmpParser')
const RequestBuilder = require('./RequestBuilder')

const parser = new XmpParser();

class Dejavoo {
  // Register ID – 90897001
  // Auth Key - pKJLdTp5u5

  /**
   *
   * @param options
   */
  constructor(options) {
    this.SPInProxy = options.SPInProxy || 'http://spinpos.net/spin'
    this.terminalIp = options.terminalIp
    this.authKey = options.authKey
    this.registerId = options.registerId
    this.terminalId = options.terminalId
    this.cgiPort = 8483 // 8445
    this.cgiStatusPort = 8484
    this.timeoutMs = (options.timeoutInSeconds || 120) * 1000
    this.countryAlpha2Code = options.countryAlpha2Code || 'CA'

    if (!this.authKey)
      throw 'Missing required options "authKey'
    if (!this.registerId && !this.terminalId)
      throw 'Missing required options "registerId" or "terminalId"'
  }

  async makeRequest(url) {
    const resp = await axios.get(url, { timeout: this.timeoutMs })
    return this._parseResponse(resp.data)
  }
  _parseResponse(respData) {
    return parser.parse(respData);
  }

  /**
   * Return true if Terminal connection status is "Online". Otherwise, false.
   * @return {Promise<boolean>}
   */
  async isOnline() {
    return (await this.checkTerminalConnection()) === 'Online'
  }

  /**
   * checkTerminalConnection
   * @return {Promise<string>} "Online" | "Offline"
   */
  async checkTerminalConnection() {
    try {
      const getTerminalStatusUrl = this.terminalId ? `${this.SPInProxy}/GetTerminalStatus?tpn=${this.terminalId}` : `${this.SPInProxy}/GetTerminalStatus?RegisterID=${this.registerId}`;
      const response = await axios.get(getTerminalStatusUrl)
      return response.data // Online || Offline
    } catch (e) {
      console.error('checkTerminalConnection', e)
    }
  }

  // /**
  //  * Check if terminal is inUse?
  //  * @return {Promise<void>}
  //  */
  // async getTerminalProcessingStatus() {
  //   try {
  //     const response = await axios.get(`${this.terminalIp}/cgi.html?GetProcessingStatus`)
  //     return response.data
  //   } catch (e) {
  //     return "No answer"
  //   }
  // }

  /**
   *
   * @param refId {number}
   * @param paymentType {PaymentType} Credit | Debit
   * @param printReceipt {PrintReceipt}
   * @return {Promise<void>}
   */
  async getTransactionStatus({refId, paymentType, printReceipt}) {
    try {
      const requestData = new RequestBuilder(this.countryAlpha2Code)
        .addTPN(this.terminalId)
        .addRegisterId(this.registerId)
        .addAuthKey(this.authKey)
        .addRefId(refId)
        .addPaymentType(paymentType)
        .addTransactionType('Status')
        .addPrintReceipt(printReceipt)
        .build()

      const url = `${this.SPInProxy}/cgi.html?TerminalTransaction=${requestData}`
      return await this.makeRequest(url)
    } catch (e) {
      let msg
      if (e.response) {
        msg = `status = ${e.response.status}, data = ${e.response.data}`
      } else {
        msg = e.message
      }
      console.error(msg);
      throw new Error(msg);
    }
  }

  /**
   *
   * @param paymentType {PaymentType}
   * @param transactionType {TransactionType}
   * @param amount {Number}
   * @param tip {Number}
   * @param frequency {Frequency}
   * @param refId {Number}
   * @param printReceipt {PrintReceipt}
   * @param sigCapture {SignatureCapture}
   * @param invoiceNumber {String} Invoice number, order id
   * @param numberOfBeeps {number} 1
   * @param tableNumber {string} table number, table id
   * @return {Promise<any>}
   */
  async terminalTransactionRequest({
                                     paymentType = PaymentType.Credit,
                                     transactionType = TransactionType.Sale,
                                     amount, tip = 0,
                                     frequency = Frequency.OneTime,
                                     refId,
                                     printReceipt = PrintReceipt.No,
                                     sigCapture = SignatureCapture.No,
                                     invoiceNumber = '',
                                     numberOfBeeps = 1,
                                     tableNumber = ''}) {
    try {
      const txRequest = new RequestBuilder(this.countryAlpha2Code)
        .addPaymentType(paymentType)
        .addTransactionType(transactionType)
        .addAmount(amount)
        .addRefId(refId)
        .addTip(tip)
        .addFrequency(frequency)
        .addInvoiceNumber(invoiceNumber)
        .addTableNumber(tableNumber)
        .addPrintReceipt(printReceipt)
        .addAlert(numberOfBeeps)
        .addSigCapture(sigCapture)
        .addTPN(this.terminalId)
        .addRegisterId(this.registerId)
        .addAuthKey(this.authKey)
        .build();

      const url = `${this.SPInProxy}/cgi.html?TerminalTransaction=${txRequest}`
      return await this.makeRequest(url)
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  /**
   * Print content
   * @param fontSize {number} size in pixel. e.g: 24, 48
   * @param content <c>Center</c><l>Left</l><r>Right</r><t>Text</t><br/><br/><br/><br/><br/><br/><br/><br/><br/>
   * @return {Promise<void>}
   */
  async printOut(fontSize, content) {
    try {
      const printerRequest = new RequestBuilder(this.countryAlpha2Code)
        .addTPN(this.terminalId)
        .addRegisterId(this.registerId)
        .addAuthKey(this.authKey)
        .add(`<printer width="${fontSize}">${content}</printer>`)
        .build();

      const url = `${this.SPInProxy}/cgi.html?Printer=${printerRequest}`
      return await this.makeRequest(url)
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  /***
   * Allow user choice between Credit & Debit
   * @param title
   * @return {Promise<any>}
   */
  async userChoice(title = 'Choose Payment') {
    try {
      const rq = new RequestBuilder(this.countryAlpha2Code)
        .addTPN(this.terminalId)
        .addRegisterId(this.registerId)
        .addAuthKey(this.authKey)
        .add(`<UserChoice title="${title}" count="2"><Choice>Credit</Choice><Choice>Debit</Choice></UserChoice>`)
        .build();
      const url = `${this.SPInProxy}/cgi.html?TerminalTransaction=${rq}`
      return await this.makeRequest(url)
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  /**
   *
   * @param title {string}
   * @param inputType {InputType}
   * @param maxLength {number}
   * @return {Promise<void>}
   */
  async userInput(title, inputType, maxLength) {
    try {
      const rq = new RequestBuilder(this.countryAlpha2Code)
        .addTPN(this.terminalId)
        .addRegisterId(this.registerId)
        .addAuthKey(this.authKey)
        .add(`<UserInput title="${title}" maxlen="${maxLength}" type="${inputType}"/>`)
        .build();

      const url = `${this.SPInProxy}/cgi.html?TerminalTransaction=${rq}`
      return await this.makeRequest(url)
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}

module.exports = Dejavoo
