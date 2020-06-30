;"use strict";
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const { TransactionsGetRequest } = require('./requests/transactionsGetRequest');

/**
 * Capture transaction
 * @param payPalClient
 * @param orderId
 * @param debug
 * @returns {Promise<*>}
 */
async function captureOrder(payPalClient, orderId, debug=false) {
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  const response = await payPalClient.execute(request);
  if (debug){
    console.log("Status Code: " + response.statusCode);
    console.log("Status: " + response.result.status);
    console.log("Capture ID: " + response.result.id);
    console.log("Links:");
    response.result.links.forEach((item, index) => {
      let rel = item.rel;
      let href = item.href;
      let method = item.method;
      let message = `\t${rel}: ${href}\tCall Type: ${method}`;
      console.log(message);
    });
    // To toggle print the whole body comment/uncomment the below line
    console.log(JSON.stringify(response.result, null, 4));
  }
  return response;
}

/**
 * Get order details
 * @param ppClient
 * @param orderId
 * @returns {Promise<void>}
 */
async function orderDetail(ppClient, orderId) {
  const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId)
  return await ppClient.execute(request)
}


/**
 * Refund transaction
 * @param payPalClient
 * @param orderId
 * @returns {Promise<void>}
 */
async function refund(payPalClient, captureId, refundRequest) {
  const request = new checkoutNodeJssdk.payments.CapturesRefundRequest(captureId);
  request.requestBody(refundRequest);
  return await payPalClient.execute(request)
}

/**
 * Execute list transaction query
 * @param payPalClient
 * @param query
 * @param debug
 * @returns {Promise<*>}
 * @private
 */
async function _execListTransactionRequest(payPalClient, query, debug) {
  const request = new TransactionsGetRequest(query);
  const response = await payPalClient.execute(request);
  if (debug)
    console.log(response);
  return response
}

/**
 * Execute single/multiple transaction queries base on params
 * @param store_id
 * @param payPalClient
 * @param start_date
 * @param end_date
 * @param output
 * @param page_index
 * @param page_size
 * @returns {Promise<{lastRefreshedDateTime: *, transactions: []}|*[]>}
 */
async function getTransactions(payPalClient, {
  /*Allow filter*/
  start_date, end_date,
  /*Pagination*/
  page_index,
  page_size,
  transaction_status,
  transaction_type,
  /*Allow options field to get transaction order detail*/
  fields
}) {
  const query =  { start_date, end_date };

  if (page_size)
    query.page_size = page_size;

  if (transaction_status)
    query.transaction_status = transaction_status;

  if (transaction_type)
    query.transaction_type = transaction_type;

  if (fields)
    query.fields = fields;

  const responses = [];
  // exec first query
  let response = await _execListTransactionRequest(payPalClient, query);
  if (response && response.statusCode === 200) {
    responses.push(response);

    // continue execute to gather all transaction
    // TODO: Known-issue: Load all transaction into memory for multiple request at the same time lead to memory issue
    if (response.result.total_pages > 1) {
      const queries = [];
      for(let i=2; i<=response.result.total_pages; ++i)
        queries.push({...query, page: i});
      responses.push.apply(responses, await Promise.all(queries.map(qry => _execListTransactionRequest(payPalClient, qry))))
    }

    const transactions = [];
    responses.forEach(({ statusCode, result }) => {
      if (statusCode === 200 && result && Array.isArray(result.transaction_details) && result.transaction_details.length > 0)
        transactions.push.apply(transactions, result.transaction_details)
    });

    return {
      transactions,
      totalPages: response.result.total_pages,
      lastRefreshedDateTime: response.result.last_refreshed_datetime
    }
  } else {
    return []
  }
}

/**
 * Get transaction detail
 * @param payPalClient
 * @param transaction_id
 * @param start_date
 * @param end_date
 * @param output
 * @returns {Promise<null|{transactions: *}>}
 */
async function getTransactionDetail(payPalClient, {
  transaction_id,
  start_date,
  end_date,
  transaction_status,
  fields,
}) {
  const query =  {
    transaction_id,
    start_date,
    end_date,
  };

  if (transaction_status)
    query.transaction_status = transaction_status;

  if (fields)
    query.fields = fields;

  // Note: A transaction ID is not unique in the reporting system.
  // The response can list two transactions with the same ID.
  // One transaction can be balance affecting while the other is non-balance affecting.
  let { statusCode, result } = await _execListTransactionRequest(payPalClient, query);
  if (statusCode === 200 && result) {
      return { transactions: result.transaction_details }
  } else {
    return null
  }
}

module.exports = {
  captureOrder,
  orderDetail,
  refund,
  getTransactions,
  getTransactionDetail,
};
