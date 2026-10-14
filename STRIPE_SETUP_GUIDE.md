# Stripe Payment Setup Guide

## Overview
This guide will help you set up Stripe payment processing for your Dazzle Glam jewelry store.

---

## Step 1: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click **Sign Up** or **Start Now**
3. Enter your email and create a password
4. Complete the business information form

---

## Step 2: Get Your API Keys

### For Development/Testing:

1. Log in to your Stripe Dashboard
2. Navigate to **Developers** > **API keys** (top right menu)
3. You'll see two keys:
   - **Publishable key**: starts with `pk_test_...`
   - **Secret key**: starts with `sk_test_...` (click "Reveal test key")

### For Production (when ready to go live):

1. Toggle from "Test mode" to "Live mode" in the Stripe Dashboard
2. Get your live keys:
   - **Publishable key**: starts with `pk_live_...`
   - **Secret key**: starts with `sk_live_...`

---

## Step 3: Update Environment Variables

Open your `.env` file and update these values:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Important Notes:**
- Use **test keys** during development
- **Never commit** your `.env` file to Git (it's already in .gitignore)
- The secret key should **never** be exposed to the frontend
- Only `NEXT_PUBLIC_*` variables are accessible in the browser

---

## Step 4: Set Up Webhooks (Required for Order Processing)

Webhooks allow Stripe to notify your application when payments succeed or fail.

### Local Development (using Stripe CLI):

1. **Install Stripe CLI**:
   - Windows: Download from [https://github.com/stripe/stripe-cli/releases](https://github.com/stripe/stripe-cli/releases)
   - Mac: `brew install stripe/stripe-cli/stripe`
   - Linux: Download binary from releases page

2. **Authenticate**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook secret** (starts with `whsec_...`) and add it to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_local_webhook_secret
   ```

### Production (after deploying):

1. Go to **Developers** > **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your production webhook URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add it to your production environment variables

---

## Step 5: Test Your Integration

### Test with Stripe Test Cards:

Stripe provides test card numbers for different scenarios:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Payment declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

**Test Details to Use:**
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Testing Process:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, run Stripe webhook listener:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Go to your checkout page
4. Use test card `4242 4242 4242 4242`
5. Complete the purchase
6. Check your Stripe Dashboard > **Payments** to see the test payment

---

## Step 6: Verify Webhook Integration

After a successful test payment:

1. Check the Stripe CLI terminal - you should see webhook events logged
2. Check your application logs for order creation
3. Verify in Stripe Dashboard > **Events** that webhooks are being received

---

## Security Best Practices

✅ **DO:**
- Keep your secret keys secure
- Use environment variables for all keys
- Use test mode during development
- Verify webhook signatures
- Enable webhook signing

❌ **DON'T:**
- Commit `.env` file to Git
- Share secret keys publicly
- Use test keys in production
- Skip webhook signature verification

---

## Common Issues & Solutions

### Issue: "No such webhook endpoint"
**Solution**: Make sure webhook URL matches your API route exactly

### Issue: "Invalid API key"
**Solution**: Check that you copied the full key including `pk_test_` or `sk_test_` prefix

### Issue: "Webhook signature verification failed"
**Solution**: Ensure `STRIPE_WEBHOOK_SECRET` matches your endpoint's signing secret

### Issue: Payments work but orders not created
**Solution**: Check that webhook listener is running and events are being received

---

## Monitoring & Management

### Stripe Dashboard Features:

1. **Payments**: View all transactions
2. **Customers**: Manage customer data
3. **Events**: Monitor webhook deliveries
4. **Logs**: Debug API requests
5. **Reports**: Track revenue and metrics

---

## Going Live Checklist

Before switching to production:

- [ ] Complete Stripe account verification
- [ ] Add business information and bank account
- [ ] Switch to live API keys in production environment
- [ ] Set up production webhook endpoint
- [ ] Test with real card (small amount)
- [ ] Enable fraud detection (Stripe Radar)
- [ ] Set up email receipts
- [ ] Configure tax settings if needed
- [ ] Review Stripe's compliance requirements

---

## Support & Resources

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: [https://support.stripe.com](https://support.stripe.com)
- **API Reference**: [https://stripe.com/docs/api](https://stripe.com/docs/api)
- **Test Cards**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## Quick Reference

```bash
# Install Stripe CLI
stripe --version

# Login to Stripe
stripe login

# Listen for webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test webhook
stripe trigger payment_intent.succeeded

# View recent events
stripe events list

# Test a payment
stripe charges create --amount=2000 --currency=usd --source=tok_visa
```

---

## Need Help?

If you encounter any issues with Stripe setup, check:
1. Stripe Dashboard > Developers > Logs
2. Your application logs
3. Stripe CLI output (if running)
4. Browser console for frontend errors

**Remember**: Always use test mode keys during development and testing!
