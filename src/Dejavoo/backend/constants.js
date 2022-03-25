const PaymentType = {
  Credit: 'Credit',
  Debit: 'Debit',
  Card: 'Card',
  EBTFood: 'EBT_Food',
  EBTCash: 'EBT_Cash',
  EBTVoucher: 'EBT_Voucher',
  Check: 'Check',
  Gift: 'Gift',
  Loyalty: 'Loyalty',
  Cash: 'Cash',
  Batch: 'Batch',
  Prepaid: 'Prepaid',
  Table: 'Table'
}

const TransactionType = {
  Sale: 'Sale',
  Return: 'Return',
  Void: 'Void',
  Auth: 'Auth',
  Ticket: 'Ticket',
  Capture: 'Capture',
  Forward: 'Forward',
  TipAdjust: 'TipAdjust',
  Settle: 'Settle',
  Balance: 'Balance',
  CashAdvance: 'CashAdvance*',
  Verification: 'Verification',
  Conversion: 'Conversion',
  Active: 'Active',
  Redeem: 'Redeem',
  Refund: 'Refund',
  Reload: 'Reload',
  Inquire: 'Inquire',
  Deactivate: 'Deactivate',
  Reissue: 'Reissue',
  AddPoints: 'AddPoints',
  Topup: 'Topup',
  Select: 'Select',
  Pay: 'Pay'
}

const SettlementType = {
  Close: 'Close',
  Clear: 'Clear',
  Force: 'Force'
}

const Frequency = {
  OneTime: 'OneTime',
  Recurring: 'Recurring'
}


const PrintReceipt = {
  No: 'No',
  Both: 'Both',
  Merchant: 'Merchant',
  Customer: 'Customer'
}

const SignatureCapture = {
  No: 'No',
  Yes: 'Yes'
}

/**
 * interface InputType
 * @type {{Numeric: string, Money: string, Alphanumeric: string, Alpha: string, Info: string}}
 */
const InputType = {
  Numeric: 'n',
  Alphanumeric: 'an',
  Alpha: 'a',
  Money: '$n',
  Info: 'i'
}


module.exports = {
  PaymentType,
  TransactionType,
  SettlementType,
  Frequency,
  PrintReceipt,
  SignatureCapture,
  InputType
}
