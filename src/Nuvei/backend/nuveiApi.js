const _ = require('lodash')
const sha512 = require('js-sha512').sha512;
const axios = require('axios');
const dayjs = require('dayjs');
const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser();

module.exports = class NuveiApi {
  constructor(terminalId, secret, operator, xmlPayment) {
    this.TERMINAL_ID = terminalId;
    this.SECRET = secret;
    this.OPERATOR = operator
    this.XML_PAYMENT = xmlPayment
  }

  _getRequestDateTime() {
    return dayjs().format('DD-MM-YYYY:HH:mm:ss:SSS')
  }

  _getHash(data) {
    return sha512(`${this.TERMINAL_ID}:${data}:${this.SECRET}`)
  }

  async _sendXmlRequest(xmlBodyStr) {
    try {
      const {data} = await axios.post(this.XML_PAYMENT, xmlBodyStr, {headers: {'Content-Type': 'text/xml'}})
      return parser.parse(data);
    } catch (e) {
      return { ERROR: { ERRORSTRING: e.message }}
    }
  }

  /**
   * https://helpdesk.nuvei.com/doku.php?id=developer:api_specification:hpp_payment_features
   * @param orderId
   * @param amount
   * @param dateTime
   * @param responseCode
   * @param responseText
   * @param responseHash
   * @return {boolean}
   */
  validatePreAuth(orderId, amount, dateTime, responseCode, responseText, responseHash) {
    return this._getHash(`${orderId}:${amount}:${dateTime}:${responseCode}:${responseText}`) === responseHash
  }

  /**
   * https://helpdesk.nuvei.com/doku.php?id=developer:api_specification:xml_payment_features#pre-auth_completion
   * @param UNIQUEREF
   * @param AMOUNT
   * @return {AxiosPromise<any>}
   */
  async completePreAuth(UNIQUEREF, AMOUNT) {
    const dateTime = this._getRequestDateTime()
    const hash = this._getHash(`${UNIQUEREF}:${AMOUNT}:${dateTime}`)
    const xmlBodyStr = `<PREAUTHCOMPLETION><UNIQUEREF>${UNIQUEREF}</UNIQUEREF><TERMINALID>${this.TERMINAL_ID}</TERMINALID><AMOUNT>${AMOUNT}</AMOUNT><DATETIME>${dateTime}</DATETIME><HASH>${hash}</HASH></PREAUTHCOMPLETION>`
    const { PREAUTHCOMPLETIONRESPONSE, ERROR } = await this._sendXmlRequest(xmlBodyStr)
    if (ERROR)
      throw new Error(ERROR.ERRORSTRING)
    return PREAUTHCOMPLETIONRESPONSE
  }

  /**
   * https://helpdesk.nuvei.com/doku.php?id=developer:api_specification:xml_payment_features#standard_refund
   * @param UNIQUEREF
   * @param AMOUNT
   * @param OPERATOR
   * @param REASON
   * @param DATETIME
   * @param HASH
   */
  async standardRefund(UNIQUEREF, AMOUNT, REASON) {
    const dateTime = this._getRequestDateTime()
    const hash = this._getHash(`${UNIQUEREF}:${AMOUNT}:${dateTime}`)
    const xmlBodyStr = `<REFUND><UNIQUEREF>${UNIQUEREF}</UNIQUEREF><TERMINALID>${this.TERMINAL_ID}</TERMINALID><AMOUNT>${AMOUNT}</AMOUNT><DATETIME>${dateTime}</DATETIME><HASH>${hash}</HASH><OPERATOR>${this.OPERATOR}</OPERATOR><REASON>${_.escape(REASON)}</REASON></REFUND>`
    const {REFUNDRESPONSE, ERROR} = await this._sendXmlRequest(xmlBodyStr);
    if (ERROR)
      throw new Error(ERROR.ERRORSTRING)
    return REFUNDRESPONSE
  }

  /**
   * https://helpdesk.nuvei.com/doku.php?id=developer:api_specification:xml_payment_features#transaction_status_update
   * @param UNIQUEREF
   * @param FROMSTATUS
   * @param TOSTATUS
   * @param APPROVALCODE
   */
  async updateTransactionStatus(UNIQUEREF, FROMSTATUS, TOSTATUS, APPROVALCODE) {
    const dateTime = this._getRequestDateTime()
    const hash = this._getHash(`${UNIQUEREF}:${this.OPERATOR}:${FROMSTATUS}:${TOSTATUS}:${APPROVALCODE}:${dateTime}`)
    const xmlBodyStr = `<TRANSACTIONUPDATE><UNIQUEREF>${UNIQUEREF}</UNIQUEREF><TERMINALID>${this.TERMINAL_ID}</TERMINALID><OPERATOR>${this.OPERATOR}</OPERATOR><FROMSTATUS>${FROMSTATUS}</FROMSTATUS><TOSTATUS>${TOSTATUS}</TOSTATUS><DATETIME>${dateTime}</DATETIME><HASH>${hash}</HASH></TRANSACTIONUPDATE>`
    const {TRANSACTIONUPDATERESPONSE, ERROR} = await this._sendXmlRequest(xmlBodyStr)
    if (ERROR)
      throw new Error(ERROR.ERRORSTRING)
    return TRANSACTIONUPDATERESPONSE
  }

  /**
   * https://helpdesk.nuvei.com/doku.php?id=developer:api_specification:xml_payment_features#transaction_retrieving
   * @param UNIQUEREF
   * @param ORDERID
   * @return {AxiosPromise<any>}
   */
  async getTransaction(UNIQUEREF, ORDERID) {
    if (!UNIQUEREF && !ORDERID)
      throw '"UNIQUEREF" or "ORDERID" must be provided.'

    if (UNIQUEREF && ORDERID)
      console.log('Both "UNIQUEREF" & "ORDERID" provided. Prefer "UNIQUEREF"')

    const dateTime = this._getRequestDateTime()
    let hash, xmlBodyStr;
    if (UNIQUEREF) {
      hash = this._getHash(`${UNIQUEREF}:${dateTime}`)
      xmlBodyStr = `<GET_TRANSACTION_DETAILS><TERMINALID>${this.TERMINAL_ID}</TERMINALID><UNIQUEREF>${UNIQUEREF}</UNIQUEREF><DATETIME>${dateTime}</DATETIME><HASH>${hash}</HASH></GET_TRANSACTION_DETAILS>`
    } else {
      hash = this._getHash(`${ORDERID}:${dateTime}`)
      xmlBodyStr = `<GET_TRANSACTION_DETAILS><TERMINALID>${this.TERMINAL_ID}</TERMINALID><ORDERID>${ORDERID}</ORDERID><DATETIME>${dateTime}</DATETIME><HASH>${hash}</HASH></GET_TRANSACTION_DETAILS>`
    }
    const {GET_TRANSACTION_DETAILS_RESPONSE, ERROR} = await this._sendXmlRequest(xmlBodyStr)
    if (ERROR)
      throw new Error(ERROR.ERRORSTRING)

    return GET_TRANSACTION_DETAILS_RESPONSE
  }
}
