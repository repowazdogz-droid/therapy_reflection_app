# Connect Your Stripe Account

## 🎯 Quick Setup (Choose One Method)

---

## Method 1: Stripe Payment Link (Easiest - Recommended)

### ✅ Step 1: Create Payment Link in Stripe

1. **Login to Stripe:** https://dashboard.stripe.com/
2. **Go to:** Products → Payment Links → **"Create payment link"**
3. **Configure:**
   - **Product:** Create new product "Lifetime Pro Access"
   - **Price:** £99.00 GBP (one-time)
   - **Description:** "Advanced Reflective Workbook + Unlimited Summaries"
4. **Set Redirect URL:**
   - In "After payment" → Redirect to: `https://YOUR-DOMAIN.vercel.app/?pro=1`
   - **Important:** Replace `YOUR-DOMAIN` with your actual Vercel URL
   - Example: `https://therapy-reflection-app.vercel.app/?pro=1`
5. **Copy the Payment Link URL** (starts with `https://buy.stripe.com/...`)

### ✅ Step 2: Add Payment Link to Code

**File:** `src/components/TherapyReflectionApp.tsx`

Replace `YOUR_STRIPE_PAYMENT_LINK_URL` with your Payment Link URL in **3 places**:
- Line ~508 (reflection upgrade button)
- Line ~706 (summary upgrade button)
- Line ~861 (main Pro card button)

**Example:**
```typescript
href="https://buy.stripe.com/your-actual-link-here"
```

### ✅ Step 3: Deploy & Test

1. Commit and push changes
2. Test with Stripe test card: `4242 4242 4242 4242`
3. After payment, should redirect to `/?pro=1`
4. Pro unlocks automatically ✅

---

## Method 2: Stripe Checkout API (More Control)

### ✅ Step 1: Get Stripe API Keys

1. **Login to Stripe:** https://dashboard.stripe.com/
2. **Go to:** Developers → API keys
3. **Copy Secret Key:**
   - Test mode: `sk_test_...` (for testing)
   - Live mode: `sk_live_...` (for production)

### ✅ Step 2: Add to Vercel Environment Variables

1. **Go to Vercel:** Your project → Settings → Environment Variables
2. **Add:**
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** Your Stripe secret key (`sk_test_...` or `sk_live_...`)
   - **Environment:** Select all (Production, Preview, Development)
3. **Save**

### ✅ Step 3: Update Code (Already Done!)

The API code is already configured to redirect with `?pro=1` ✅

**File:** `api/create-checkout-session.ts`
- Success URL: `${req.headers.origin}/?pro=1` ✅
- Price: £99.00 ✅

### ✅ Step 4: Update Frontend to Use API

If you want to use the API instead of Payment Links, update `TherapyReflectionApp.tsx`:

Replace the Payment Link `<a>` tags with `<BuyProButton />` component (which uses the API).

### ✅ Step 5: Deploy & Test

1. Redeploy on Vercel (to pick up `STRIPE_SECRET_KEY`)
2. Test with Stripe test card: `4242 4242 4242 4242`
3. After payment, redirects to `/?pro=1`
4. Pro unlocks automatically ✅

---

## 🧪 Testing

### Test Cards (Stripe Test Mode)

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

**Expiry:** Any future date (e.g., 12/25)  
**CVC:** Any 3 digits (e.g., 123)  
**ZIP:** Any 5 digits (e.g., 12345)

---

## 📋 Checklist

### For Payment Link:
- [ ] Created Stripe Payment Link
- [ ] Set redirect URL to `https://YOUR-DOMAIN/?pro=1`
- [ ] Copied Payment Link URL
- [ ] Replaced `YOUR_STRIPE_PAYMENT_LINK_URL` in code (3 places)
- [ ] Tested payment flow

### For Stripe API:
- [ ] Got Stripe Secret Key from dashboard
- [ ] Added `STRIPE_SECRET_KEY` to Vercel environment variables
- [ ] Redeployed on Vercel
- [ ] Tested payment flow

---

## 🆘 Troubleshooting

**Payment Link not redirecting?**
- Check redirect URL includes `?pro=1`
- Make sure URL matches your Vercel deployment exactly

**API not working?**
- Check `STRIPE_SECRET_KEY` is set in Vercel
- Check you're using test key for test mode
- Check Vercel function logs for errors

**Pro not unlocking?**
- Check browser console for errors
- Verify `?pro=1` is in URL after redirect
- Check `localStorage` for `tra_pro_unlocked_v1` = "true"

---

## 💡 Recommendation

**Use Stripe Payment Link** - It's simpler, no API keys needed, and works immediately!

