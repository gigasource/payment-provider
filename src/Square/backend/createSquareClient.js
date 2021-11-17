const { Client, Environment } = require('square');

function createSquareClient(accessToken) {
  console.log('sandbox mode?', process.env.SQUARE_MODE === 'sandbox')
  return new Client({
    environment: process.env.SQUARE_MODE === 'sandbox' ? Environment.Sandbox : Environment.Production,
    accessToken: accessToken,
  })
}

module.exports = createSquareClient;
