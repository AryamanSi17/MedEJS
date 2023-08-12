// const CCAvenue = require('ccavenue-node');

// // Configure CC Avenue credentials
// const ccav = new CCAvenue({
//   merchant_id: '2619634',
//   access_code: 'AVXS84KG03AB82SXBA',
//   working_key: '54F13BF3E980C578DC1723E6B8E4C932',
//   redirect_url: 'moodle.upskill.globalmedacademy.com',
//   cancel_url: 'globalmedacademy.com',
// });

// module.exports = ccav;
// ccavenue.js

const crypto = require('crypto');

// Replace with your CCAvenue credentials
const MERCHANT_ID = '2619634';
const ACCESS_CODE = 'AVXS84KG03AB82SXBA';
const WORKING_KEY = '54F13BF3E980C578DC1723E6B8E4C932';

function initiatePayment(req, res) {
    const orderData = {
        order_id: '123456',
        amount: '100.00',
        currency: 'INR',
        redirect_url: 'http://localhost:3000/payment-response',
        cancel_url: 'http://localhost:3000/payment-cancelled',
        // ... add other required fields
    };

    const encryptedData = encrypt(orderData);

    res.send(`
        <form action="https://test.ccavenue.com/transaction/transaction.do" method="post">
            <input type="hidden" name="encRequest" value="${encryptedData}">
            <input type="hidden" name="access_code" value="${ACCESS_CODE}">
            <input type="submit" value="Pay Now">
        </form>
    `);
}

function handlePaymentResponse(req, res) {
    const encryptedResponse = req.body.encResponse;
    const decryptedData = decrypt(encryptedResponse);
    // Handle the payment status (success, failure, etc.)
    // ...
    res.send('Payment response received.');
}

function handlePaymentCancellation(req, res) {
    res.send('Payment was cancelled.');
}

const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(data) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(WORKING_KEY, 'hex'), iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + encrypted; // prepend IV to the encrypted data
}

function decrypt(data) {
    const iv = Buffer.from(data.slice(0, 32), 'hex'); // extract IV from the first 32 characters
    const encryptedText = data.slice(32);
    const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(WORKING_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
}

module.exports = {
    initiatePayment,
    handlePaymentResponse,
    handlePaymentCancellation
};
