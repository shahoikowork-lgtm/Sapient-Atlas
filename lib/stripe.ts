import Stripe from 'stripe'

// SERVER ONLY. Never import in a client component (reads STRIPE_SECRET_KEY).
// Non-empty fallback so the module never throws at import if the key is unset, 
// real API calls then fail with a clear Stripe auth error instead of a crash.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_unset', {
  typescript: true,
  appInfo: { name: 'Sapient Atlas' },
})
