require("dotenv").config();
const Stripe = require("stripe");

// Use dummy key for development if real key not provided
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_51DummyKeyForDevelopment000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("your_stripe_secret_key")) {
  console.warn("⚠️ Stripe Secret Key not configured properly");
  console.log("📝 Using dummy key for development");
  console.log("💡 To fix: Update STRIPE_SECRET_KEY in .env with your actual Stripe secret key");
}

try {
  const stripe = new Stripe(stripeKey);
  module.exports = stripe;
} catch (error) {
  console.warn("⚠️ Stripe configuration warning:", error.message);
  module.exports = null; // Continue without Stripe for development
}
