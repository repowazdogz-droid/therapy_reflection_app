# Stripe Payment Link Custom Confirmation Page Setup

## ✅ What's Already Done

Your app now has a beautiful custom confirmation page at:
**`/#/stripe-success`**

This page:
- ✅ Unlocks Pro immediately on load
- ✅ Shows gorgeous beige/earthy aesthetic (#FEF9F5 background)
- ✅ Displays workbook cover image (if uploaded)
- ✅ Handwritten-style "Welcome to Lifetime Pro!" title
- ✅ Warm thank you message
- ✅ Beautiful download button for PDF
- ✅ Designer credit: "Designed by Aoife McDermott • Printable & yours forever"
- ✅ Gentle confetti burst (earthy colors)
- ✅ Auto-redirects to homepage after 15 seconds
- ✅ "Continue to app" button with countdown

---

## 🔧 Step-by-Step Setup in Stripe Dashboard

### 1. Go to Your Stripe Payment Link

1. **Login to Stripe:** https://dashboard.stripe.com/
2. **Navigate to:** Products → Payment Links
3. **Click** on your £99 Payment Link

### 2. Configure Custom Confirmation Page

1. **Scroll down** to "After payment" section
2. **Select:** "Custom confirmation page"
3. **Confirmation page URL:** 
   ```
   https://YOUR-DOMAIN.vercel.app/#/stripe-success
   ```
   Replace `YOUR-DOMAIN` with your actual Vercel URL.
   
   **Example:**
   ```
   https://therapy-reflection-app.vercel.app/#/stripe-success
   ```

### 3. Set Redirect URL (for auto-redirect)

**Redirect URL:** (This is what happens after the confirmation page)
```
https://YOUR-DOMAIN.vercel.app/?pro=1
```

**Important:** The `?pro=1` parameter ensures Pro unlocks automatically when they land on your homepage.

### 4. Save Changes

Click **"Save"** at the bottom of the Payment Link settings.

---

## 📸 Optional: Upload Workbook Cover Image

If you want to show the workbook cover image on the confirmation page:

1. **Upload image** to: `public/bonuses/workbook-cover.jpg`
2. **Recommended size:** 800x1000px (portrait orientation)
3. **Format:** JPG or PNG
4. The page will automatically display it if the file exists.

**Note:** The page looks great even without the cover image!

---

## 🧪 Testing

### Test Flow:

1. **Click** "Upgrade to Pro – £99" button
2. **Use test card:** `4242 4242 4242 4242`
3. **Complete payment**
4. **Should redirect to:** `/#/stripe-success`
5. **See:** Beautiful confirmation page with confetti
6. **After 15 seconds:** Auto-redirects to `/?pro=1`
7. **Verify:** Pro is unlocked (check for Pro badge)

### Test Cards:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

**Expiry:** Any future date (e.g., 12/25)  
**CVC:** Any 3 digits (e.g., 123)  
**ZIP:** Any 5 digits (e.g., 12345)

---

## 🎨 Customization

The confirmation page is in:
**`src/pages/StripeConfirmationPage.tsx`**

You can customize:
- Colors (currently beige/earthy tones)
- Text content
- Confetti colors
- Countdown duration (currently 15 seconds)
- Button styles

---

## ✅ Checklist

- [ ] Stripe Payment Link created
- [ ] Custom confirmation page URL set: `https://YOUR-DOMAIN.vercel.app/#/stripe-success`
- [ ] Redirect URL set: `https://YOUR-DOMAIN.vercel.app/?pro=1`
- [ ] Payment Link saved
- [ ] Tested payment flow
- [ ] Verified Pro unlocks automatically
- [ ] (Optional) Uploaded workbook cover image

---

## 🆘 Troubleshooting

**Confirmation page not showing?**
- Check the URL in Stripe matches exactly: `/#/stripe-success`
- Make sure you're using hash routing (`#/` not `/`)
- Check Vercel deployment is live

**Pro not unlocking?**
- Check browser console for errors
- Verify `?pro=1` is in URL after redirect
- Check `localStorage` for `tra_pro_unlocked_v1` = "true"

**PDF download not working?**
- Verify PDF exists at: `public/bonuses/The Advanced Reflective Workbook- new new.pdf`
- Check filename matches exactly (with spaces)

---

## 🎉 You're All Set!

Your Stripe Payment Link now has a gorgeous, therapist-grade confirmation page that matches your workbook aesthetic perfectly!

