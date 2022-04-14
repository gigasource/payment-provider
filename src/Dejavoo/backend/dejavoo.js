const axios = require('axios');
const {AxiosError} = require('axios');
const {InputType, ReportType, PaymentType, TransactionType, PrintReceipt, SignatureCapture, Frequency} = require('./constants')
const XmpParser = require('./XmpParser')
const RequestBuilder = require('./RequestBuilder')

const parser = new XmpParser();

class Dejavoo {
  /**
   *
   * @param options
   */
  constructor(options) {
    this.SPInProxy = options.SPInProxy || 'https://spinpos.net/spin'
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
  async makeTxRequest(requestData) {
    const url = `${this.SPInProxy}/cgi.html?TerminalTransaction=${requestData}`
    return this.makeRequest(url)
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
  async getTxStatus({refId, paymentType, printReceipt}) {
    try {
      const rq = new RequestBuilder(this.countryAlpha2Code)
        .addRegisterId(this.registerId)
        .addAuthKey(this.authKey)
        .addRefId(refId)
        .addPaymentType(paymentType)
        .addTransactionType(TransactionType.Status)
        .addPrintReceipt(printReceipt)
        .build();
      return await this.makeTxRequest(rq)
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
  async requestTx({
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
      const rq = new RequestBuilder(this.countryAlpha2Code)
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

      const data = await this.makeTxRequest(rq)
      if (data.response) {
        if (data.response.ExtData) {
          data.response.ParsedExtData = {}
          data.response.ExtData.split(',').map(kvp => {
            const [k, v] = kvp.split('=')
            data.response.ParsedExtData[k] = v
          })
        }
        if (data.response.EMVData) {
          data.response.ParsedEMVData = {}
          data.response.EMVData.split(',').map(kvp => {
            const [k, v] = kvp.split('=')
            data.response.ParsedEMVData[k] = v
          })
        }
      }
      return data;
    } catch (e) {
      console.error(e)
      throw new Error(e.message)
    }
  }

  /**
   * Capture Pre-Auth
   * @param invoiceNumber {String} [mandatory] invoice number
   * @param amount {Number} [mandatory] amount to capture
   * @param tip {Number} [optional] [default = 0] tip
   * @param refId {Number} [mandatory] Reference Id of PreAuth response
   * @param authCode {Number} [mandatory] AuthCode in PreAuth response
   * @param clerkId {Number} [optional] Clerk Id
   * @return {Promise<any>} Capture response
   */
  async captureTx({invoiceNumber = '', amount, tip = 0, refId, authCode, clerkId}) {
    try {
      const rq = new RequestBuilder(this.countryAlpha2Code)
        .addTransactionType(TransactionType.Capture)
        .addInvoiceNumber(invoiceNumber)
        .addAmount(amount)
        .addTip(tip)
        .addRefId(refId)
        .addAuthCode(authCode)
        .addClerkId(clerkId)
        .addRegisterId(this.registerId)
        .addAuthKey(this.authKey)
        .build();
      return await this.makeTxRequest(rq)
    } catch (e) {
      console.error('Capture request', e)
      throw new Error(e.message)
    }
  }

  /**
   * Void Transaction is used to cancel a previously authorized transaction until the batch was closed.
   * Host system must use data from the original transaction in order for the Terminal to locate the transaction and process Void request.
   * @param paymentType {PaymentType} paymentType
   * @param refId {Number} Reference id
   * @param amount {Number} amount to void
   * @return {Promise<any>} Void Tx Response
   */
  async voidTx({paymentType, refId, amount}) {
    try {
      const rq = new RequestBuilder(this.countryAlpha2Code)
        .addPaymentType(paymentType)
        .addTransactionType(TransactionType.Void)
        .addRefId(refId)
        .addAmount(amount)
        .addRegisterId(this.registerId)
        .addAuthKey(this.authKey)
        .build();
      return await this.makeTxRequest(rq)
    } catch (e) {
      console.error(e)
      throw new Error(e.message)
    }
  }

  /***
   * Reportstatus request is used by the Host System to check what transactions are within the current batch stored in the terminal.
   * @param reportType {ReportType} report type
   * @return {Promise<void>} report Tx Status response
   */
  async reportTxStatus({reportType}) {
    try {
      const rq = new RequestBuilder(this.countryAlpha2Code)
        .addTransactionType(TransactionType.Report)
        .addReportType(reportType)
        .addRegisterId(this.registerId)
        .addAuthKey(this.authKey)
        .build();
      return await this.makeTxRequest(rq)
    } catch (e) {
      console.error('Capture request', e)
      throw new Error(e.message)
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
      const rq = new RequestBuilder(this.countryAlpha2Code)
        .addTPN(this.terminalId)
        .addRegisterId(this.registerId)
        .addAuthKey(this.authKey)
        .add(`<printer width="${fontSize}">${content}</printer>`)
        .build();

      const url = `${this.SPInProxy}/cgi.html?Printer=${rq}`
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
      return await this.makeTxRequest(rq)
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
      return await this.makeTxRequest(rq)
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}

module.exports = Dejavoo
