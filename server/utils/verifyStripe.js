const stripe = require('../config/stripe.js');

const verifyStripeConfiguration = async () => {
  console.log('🔍 Verifying Stripe Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`STRIPE_ENPOINT_WEBHOOK_SECRET_KEY: ${process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL ? '✅ Set' : '❌ Missing'}`);
  console.log('');

  // Test Stripe connection
  try {
    console.log('🔗 Testing Stripe Connection...');
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Stripe connected successfully!`);
    console.log(`Account ID: ${account.id}`);
    console.log(`Country: ${account.country}`);
    console.log(`Charges enabled: ${account.charges_enabled ? '✅' : '❌'}`);
    console.log(`Payouts enabled: ${account.payouts_enabled ? '✅' : '❌'}`);
  } catch (error) {
    console.log('❌ Stripe connection failed:');
    console.log(`Error: ${error.message}`);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('💡 This usually means your STRIPE_SECRET_KEY is invalid or missing.');
    }
  }

  console.log('\n🧪 To test Stripe payments, use these test cards:');
  console.log('✅ Success: 4242424242424242');
  console.log('❌ Declined: 4000000000000002');
  console.log('🔐 Requires Auth: 4000002500003155');
  console.log('\n📖 More test cards: https://stripe.com/docs/testing#cards');
};

// Run verification if this file is executed directly
if (require.main === module) {
  verifyStripeConfiguration().catch(console.error);
}

module.exports = { verifyStripeConfiguration };