const stripe = require('stripe')('sk_test_51NqeaaSAfyNJyYlUfytEZPSnxZ5mqLWwCx96us0UjXRqT5F5Wp0sUOWBk7vr8p2YxIX26vISeuQtnvMqBfNiAEd600oh9mbHVK');

async function createCheckoutSession(line_items) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: 'http://www.globalmedacademy.com/success?payment_intent={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://www.globalmedacademy.com/cancel',   
    });
    return session;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = { createCheckoutSession };

