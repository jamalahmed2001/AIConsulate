# Dynamic Credits and Stripe Portal Documentation

## Dynamic Credit Purchases

We've implemented a flexible system that allows users to purchase any amount of credits without needing to create Stripe products for each amount.

### How It Works

1. **Dynamic Pricing API** (`/api/billing/dynamic-checkout`)
   - Accepts any credit amount between 10 and 100,000
   - Calculates price with volume discounts:
     - Base rate: $0.01 per credit
     - 500+ credits: 5% discount ($0.0095/credit)
     - 2,000+ credits: 10% discount ($0.009/credit)
     - 5,000+ credits: 20% discount ($0.008/credit)
   - Creates Stripe checkout session with dynamic `price_data`
   - Stores credit amount in session metadata

2. **Webhook Processing**
   - Webhook handler checks for `metadata.type === "dynamic_credits"`
   - Reads credit amount from `metadata.credits`
   - Grants exact amount to user's balance
   - Works for both one-time purchases and subscriptions

3. **UI Component**
   - Custom credit input on `/credits` page
   - Real-time price calculation
   - Shows volume discount tiers
   - Input validation (10-100,000 credits)

### Usage Example

```javascript
// Purchase custom amount of credits
const response = await fetch("/api/billing/dynamic-checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    credits: 2500,  // Any amount between 10-100,000
    mode: "payment" // or "subscription" for recurring
  })
});

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe
```

## Stripe Customer Portal Access

The Stripe Customer Portal allows users to:
- View payment history
- Update payment methods
- Cancel or modify subscriptions
- Download invoices

### Portal Access Points

1. **Direct API Access** (`/api/billing/portal-link`)
   - Supports both GET and POST methods
   - GET: Immediate redirect to portal
   - POST: Returns portal URL in JSON response

2. **UI Access Points**:
   
   a. **Dashboard** (`/dashboard`)
   ```tsx
   <CTA
     href="/api/billing/portal-link"
     tone="secondary"
     size="sm"
     label="Manage Subscription"
   />
   ```
   
   b. **Credits Page** (`/credits`)
   ```tsx
   {subscription?.active && (
     <CTA
       href="/api/billing/portal-link"
       tone="ghost"
       label="Manage Subscription"
     />
   )}
   ```

### Portal Configuration

1. **Return URL**: Set in environment variable
   ```env
   BILLING_PORTAL_RETURN_URL=https://yourdomain.com/dashboard
   ```

2. **Stripe Dashboard Settings**:
   - Go to Stripe Dashboard → Settings → Billing → Customer Portal
   - Enable features:
     - ✅ Invoices
     - ✅ Update payment methods
     - ✅ Cancel subscriptions
     - ✅ Switch plans (if you have multiple)

### Implementation Details

```typescript
// API endpoint: /api/billing/portal-link.ts
export default async function handler(req, res) {
  const session = await auth();
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get or create customer
  const customer = await getOrCreateStripeCustomer(session.user.id);
  
  // Create portal session
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customer.providerCustomerId,
    return_url: env.BILLING_PORTAL_RETURN_URL
  });

  // Handle GET (direct redirect) or POST (return URL)
  if (req.method === "GET") {
    return res.redirect(303, portalSession.url);
  } else {
    return res.json({ url: portalSession.url });
  }
}
```

## Benefits of Dynamic System

1. **No Product Management**: No need to create/maintain Stripe products for every credit amount
2. **Flexible Pricing**: Easy to adjust pricing tiers without touching Stripe
3. **Volume Discounts**: Automatic discounts based on purchase amount
4. **Better UX**: Users can buy exactly what they need
5. **Simplified Admin**: One system handles all credit purchases

## Testing Dynamic Credits

1. **Test Custom Amount**:
   ```bash
   # Use Stripe test card: 4242 4242 4242 4242
   # Purchase 1,234 credits
   # Verify exact amount in dashboard
   ```

2. **Test Volume Discounts**:
   - Try 499 credits → $4.99 (no discount)
   - Try 500 credits → $4.75 (5% discount)
   - Try 2,000 credits → $18.00 (10% discount)
   - Try 5,000 credits → $40.00 (20% discount)

3. **Test Portal Access**:
   - Click "Manage Subscription" from dashboard
   - Verify redirect to Stripe portal
   - Test cancel/resume subscription

## Future Enhancements

- [ ] Custom subscription amounts (e.g., 1,000 credits/month)
- [ ] Bulk purchase API for enterprise
- [ ] Credit gifting between users
- [ ] Promo codes for credit bonuses
- [ ] Usage-based billing tiers
