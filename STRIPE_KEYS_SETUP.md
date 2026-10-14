# 🔑 How to Get Stripe Test Keys

## Problem
You're using **LIVE keys** but Stripe won't work until your account is fully verified and activated.

## Solution: Use TEST Keys for Development

### Step 1: Go to Stripe Dashboard
1. Visit: https://dashboard.stripe.com
2. Log in to your account

### Step 2: Switch to TEST MODE
**IMPORTANT:** In the top right corner, you'll see a toggle switch that says:
- "Test mode" (should be OFF - switch it ON)
- Or "Viewing test data" 

**Click to enable TEST MODE!**

### Step 3: Get Your TEST API Keys
1. Click on **Developers** in the left menu
2. Click on **API keys**
3. You'll see:
   - **Publishable key**: `pk_test_...` (copy this)
   - **Secret key**: Click "Reveal test key" → `sk_test_...` (copy this)

### Step 4: Update Your .env File

Open your `.env` file and **REPLACE** the current keys:

```env
# REPLACE THESE LINES:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
```

**Example:**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbC123xyz...
STRIPE_SECRET_KEY=sk_test_51AbC123xyz...
```

### Step 5: Restart Dev Server
1. Stop server: Press `Ctrl + C` in terminal
2. Start again: `npm run dev`

### Step 6: Test with Test Card
Use this card number on Stripe checkout:
- **Card**: `4242 4242 4242 4242`
- **Expiry**: `12/34` (any future date)
- **CVC**: `123` (any 3 digits)
- **ZIP**: `12345` (any ZIP)

---

## Why Test Keys?

✅ **Test keys work immediately** - No verification needed
✅ **No real money charged** - Safe for testing
✅ **Same features as live** - Everything works
✅ **Unlimited testing** - Test as much as you want

❌ **Live keys require**:
- Business verification
- Bank account verification  
- Identity verification
- Can take 1-2 days for approval

---

## Current Keys in Your .env

Your current `.env` has:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51Twjbu... (LIVE KEY)
STRIPE_SECRET_KEY=sk_live_51Twjbu... (LIVE KEY)
```

These are **LIVE keys** and won't work until Stripe activates your account!

---

## Quick Fix Steps:

1. **Go to**: https://dashboard.stripe.com
2. **Toggle** to "Test mode" (top right)
3. **Click**: Developers → API keys
4. **Copy**: pk_test_... and sk_test_... keys
5. **Paste** in `.env` file
6. **Restart**: `npm run dev`
7. **Test**: Use card 4242 4242 4242 4242

---

## After Testing Works

Once test payments work, you can:
1. Complete Stripe account verification
2. Add bank account details
3. Verify your identity
4. Switch back to LIVE keys
5. Accept real payments!

---

**For now, USE TEST KEYS to get it working!** 🚀
