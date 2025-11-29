# Stripe Integration Guide

## Files Created

✅ **API Routes:**
- `api/create-checkout-session.ts` - Creates Stripe checkout sessions
- `api/verify-session.ts` - Verifies payment completion

✅ **Components:**
- `src/components/BuyAccessButton.tsx` - Buy button component
- `src/pages/SuccessPage.tsx` - Success page with PDF download
- `src/hooks/useOmegaPro.ts` - Hook to check Pro status

✅ **Package.json:**
- Updated with `stripe: ^14.0.0` dependency

✅ **Public Folder:**
- `public/products/` - Place your PDF here as `The Advanced Reflective Workbook.pdf`

## Integration Steps

### 1. Update App.tsx

Add routing for success/cancelled pages:

```tsx
import { SuccessPage } from "./pages/SuccessPage"

type AppView = "landing" | "app" | "unlock-pro" | "success" | "cancelled"

// In your routing logic:
if (hash.startsWith("#/success") || hash.startsWith("#success")) {
  setView("success")
} else if (hash === "#/cancelled" || hash === "#cancelled") {
  setView("cancelled")
}

// Render success page:
if (view === "success") {
  return <SuccessPage />
}

// Render cancelled page:
if (view === "cancelled") {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Payment Cancelled</h1>
      <p>Your payment was cancelled. No charges were made.</p>
    </div>
  )
}
```

### 2. Update TherapyReflectionApp.tsx

Add Stripe integration:

```tsx
import { useOmegaPro } from "../hooks/useOmegaPro"
import BuyAccessButton from "./BuyAccessButton"

// Replace existing Pro check with:
const isPro = useOmegaPro()

// In your premium/pack section, replace Gumroad links with:
{!isPro ? (
  <BuyAccessButton />
) : (
  <p>✓ Already unlocked on this device</p>
)}
```

### 3. Environment Variables

Set in Vercel:
- `STRIPE_SECRET_KEY` - Your Stripe secret key (sk_test_... or sk_live_...)

### 4. Upload PDF

Place your PDF at:
```
public/products/The Advanced Reflective Workbook.pdf
```

## Testing

1. Install dependencies: `npm install`
2. Set `STRIPE_SECRET_KEY` in Vercel
3. Upload PDF to `public/products/`
4. Test with Stripe test card: `4242 4242 4242 4242`

