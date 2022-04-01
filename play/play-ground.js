require('dotenv').config()
const Dejavoo = require('../src/Dejavoo/backend/dejavoo')
const constants = require('../src/Dejavoo/backend/constants')
const RequestBuilder = require('../src/Dejavoo/backend/RequestBuilder')
const PrintOutContentBuilder = require('../src/Dejavoo/backend/PrintOutContentBuilder')
const {TextAlignment} = require('../src/Dejavoo/backend/PrintOutContentBuilder')

const dejavoo = new Dejavoo({
  authKey: process.env.AUTH_KEY,
  registerId: process.env.REGISTER_ID,
  timeoutInSeconds: 1200
})

// check if device online or not
// dejavoo.isOnline().then(console.log)

// print text
// dejavoo.printOut(24, `<c>Hello there</c><br/><br/><br/><br/><br/><br/><br/>`).then(console.log)
// const printContent = new PrintOutContentBuilder()
//   .txt('Header', { bold: true, alignment: TextAlignment.center }).lf()
//   .txt('02-15-2014').txt('09:45:29').lf()
//   .img('Qk...AAA=').lf().lf().lf().lf()
//   .build();
// dejavoo.printOut(24, printContent).then(console.log)

// dejavoo.userInput('Enter CVV', constants.InputType.Numeric, 3).then(console.log)
// dejavoo.userChoice().then(console.log)
// dejavoo.getTransactionStatus({
//   refId: 1,
//   paymentType: constants.PaymentType.Credit,
//   printReceipt: constants.PrintReceipt.No
// }).then(console.log)

dejavoo.requestTx({
  paymentType: constants.PaymentType.Card,
  transactionType: constants.TransactionType.Sale,
  amount: 0.01,
  tip: 0,
  frequency: constants.Frequency.OneTime,
  refId: 3,
  printReceipt: constants.PrintReceipt.No,
  sigCapture: constants.SignatureCapture.No,
  invoiceNumber: 1234,
  numberOfBeeps: 3,
  tableNumber: 1
}).then(console.log)

// For Pro User
// const requestPayload = new RequestBuilder('CA').addAuthKey(process.env.AUTH_KEY).addRegisterId(process.env.REGISTER_ID).add(`<printer width="24"><c>Lorem ispum</c><br/><br/><br/><br/><br/><br/><br/></printer>`).build()
// dejavoo.makeRequest(`${dejavoo.SPInProxy}/cgi.html?Printer=${requestPayload}`).then(console.log)
