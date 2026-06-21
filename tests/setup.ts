// Test environment defaults. These only need to be present (the Supabase/Stripe
// clients and the email transport are mocked in the tests), but the modules read
// them at import time, so give them harmless values.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-service-role-key'
process.env.STRIPE_WEBHOOK_SECRET ||= 'whsec_test'
process.env.STRIPE_SECRET_KEY ||= 'sk_test_unset'
process.env.NEXT_PUBLIC_SITE_URL ||= 'https://atlas.test'
process.env.ADMIN_EMAILS ||= 'admin@test.com'
