# Integration Instructions

## ✅ Files Created

1. **SuccessPage.tsx** - `src/SuccessPage.tsx` ✅
2. **CancelledPage.tsx** - `src/CancelledPage.tsx` ✅
3. **useOmegaPro hook** - `src/hooks/useOmegaPro.ts` ✅ (updated)
4. **BuyAccessButton** - `src/components/BuyAccessButton.tsx` ✅

## 📝 Files You Need to Update

### 1. Update `src/App.tsx`

Add these imports and routes:

```tsx
import { HashRouter, Routes, Route } from "react-router-dom"
import SuccessPage from "./SuccessPage"
import CancelledPage from "./CancelledPage"

// In your HashRouter:
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/reflect" element={<TherapyReflectionApp />} />
  <Route path="/success" element={<SuccessPage />} />
  <Route path="/cancelled" element={<CancelledPage />} />
</Routes>
```

### 2. Update `src/components/TherapyReflectionApp.tsx`

Add these imports at the top:

```tsx
import BuyAccessButton from "./BuyAccessButton"
import { useOmegaPro } from "../hooks/useOmegaPro"
```

Inside your component, add:

```tsx
const TherapyReflectionApp = () => {
  const isPro = useOmegaPro()
  
  // ... your existing code ...
  
  // Add this before your summarise section:
  {!isPro && (
    <div className="my-4 p-4 border rounded-md bg-white/40">
      <BuyAccessButton />
      <p className="text-xs text-gray-600 mt-2">
        Unlock unlimited summaries + PDF for £14.99
      </p>
    </div>
  )}
  
  // ... rest of your component ...
}
```

## 📄 PDF Location

👉 Place your PDF here EXACTLY:
```
public/products/the-advanced-reflective-workbook.pdf
```

## ✅ Stripe API Routes

Already created:
- `api/create-checkout-session.ts` ✅
- `api/verify-session.ts` ✅

## 🔧 Environment Variables

Set in Vercel:
- `STRIPE_SECRET_KEY` - Your Stripe secret key

## 📦 Install Dependencies

Run: `npm install` to get the Stripe package

