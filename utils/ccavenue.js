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
const WORKING_KEY = '4F36008225C13DE3D93C01E481D3645F';

function initiatePayment(req, res) {
    try {
        console.log('Initiating payment...');

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
    } catch (error) {
        console.error('Error in initiatePayment:', error);
        res.status(500).send('Internal Server Error');
    }
}

function handlePaymentResponse(req, res) {
    try {
        console.log('Handling payment response...');

        if (!req.body || !req.body.encResponse) {
            throw new Error('Invalid encrypted response received.');
        }

        const encryptedResponse = req.body.encResponse;
        const decryptedData = decrypt(encryptedResponse);

        // Handle the payment status (success, failure, etc.)
        console.log('Decrypted payment response:', decryptedData);

        res.send('Payment response received.');
    } catch (error) {
        console.error('Error in handlePaymentResponse:', error);
        res.status(500).send('Internal Server Error');
    }
}

function handlePaymentCancellation(req, res) {
    console.log('Payment was cancelled.');
    res.send('Payment was cancelled.');
}

const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(data) {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(WORKING_KEY, 'hex'), iv);
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + encrypted;
    } catch (error) {
        console.error('Error in encrypt:', error);
        throw error;
    }
}

function decrypt(data) {
    try {
        const iv = Buffer.from(data.slice(0, 32), 'hex');
        const encryptedText = data.slice(32);
        const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(WORKING_KEY, 'hex'), iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Error in decrypt:', error);
        throw error;
    }
}

module.exports = {
    initiatePayment,
    handlePaymentResponse,
    handlePaymentCancellation
};
