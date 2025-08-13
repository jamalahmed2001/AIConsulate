# AI Credits System Documentation

## Overview

This project implements a complete credit-based system for AI features with Stripe integration. Users can purchase credits through one-time payments or subscriptions, and credits are consumed when using AI-powered features.

## Features

- ✅ **Credit Packages**: One-time purchases that never expire
- ✅ **Subscriptions**: Monthly/yearly plans with automatic credit renewal
- ✅ **Stripe Integration**: Secure payment processing and subscription management
- ✅ **Webhook Handling**: Automatic credit granting on successful payments
- ✅ **Usage Tracking**: Real-time credit balance and usage history
- ✅ **Idempotent Operations**: Prevents double-spending with idempotency keys
- ✅ **Dashboard Integration**: View credits and manage subscriptions
- ✅ **Example Implementation**: Working AI feature that consumes credits

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs (create these in Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_...

# Site Configuration
SITE_URL=http://localhost:3000
BILLING_PORTAL_RETURN_URL=http://localhost:3000/dashboard

# Admin API Key (for syncing prices)
ADMIN_API_KEY=your-secret-admin-key
```

### 2. Database Setup

The system uses these Prisma models (already included):

- `Product`: Stores product information
- `Price`: Stores pricing details with credit metadata
- `Subscription`: Tracks active subscriptions
- `CreditLedger`: Records all credit transactions
- `UsageEvent`: Tracks feature usage
- `Customer`: Links users to Stripe customers

### 3. Stripe Configuration

1. **Create Products in Stripe Dashboard**:
   - One-time credit packs (e.g., 100, 500, 2000 credits)
   - Subscription plans (monthly/yearly)

2. **Add Metadata to Prices**:
   - Add `includedCredits` metadata to each price
   - Example: `includedCredits: "100"` for 100 credits

3. **Configure Webhook Endpoint**:
   - Add webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

### 4. Sync Prices from Stripe

Run this command to sync your Stripe products/prices to the database:

```bash
curl -X POST http://localhost:3000/api/billing/sync-prices \
  -H "x-admin-key: your-secret-admin-key"
```

## Usage Guide

### For Users

1. **Purchase Credits**:
   - Navigate to `/credits`
   - Choose a one-time pack or subscription
   - Complete payment through Stripe Checkout

2. **View Balance**:
   - Check dashboard at `/dashboard`
   - Balance shown in real-time

3. **Use AI Features**:
   - Try the example at `/example-ai`
   - Credits deducted automatically

4. **Manage Subscription**:
   - Click "Manage Subscription" on dashboard
   - Redirects to Stripe Customer Portal

### For Developers

#### Using Credits in Your Features

```typescript
// 1. Import necessary functions
import { generateAccessToken } from "@/server/auth/tokens";

// 2. In your API endpoint
const token = await generateAccessToken(userId, "feature-name");

// 3. Spend credits
const response = await fetch("/api/credits/spend", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    amount: 5, // Number of credits to spend
    feature: "ai-generation", // Feature identifier
    idempotencyKey: "unique-request-id" // Prevent double-spending
  })
});

// 4. Handle response
if (!response.ok) {
  // Handle insufficient credits (402) or other errors
}
```

#### Granting Credits Programmatically

```bash
# Admin endpoint for granting credits
curl -X POST http://localhost:3000/api/credits/grant \
  -H "x-admin-key: your-secret-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "amount": 100,
    "reason": "promotional",
    "idempotencyKey": "unique-grant-id"
  }'
```

## API Endpoints

### Public Endpoints

- `POST /api/billing/checkout-session`: Create Stripe checkout session
- `GET/POST /api/billing/portal-link`: Redirect to Stripe Customer Portal
- `POST /api/webhooks/stripe`: Handle Stripe webhooks

### Protected Endpoints

- `POST /api/credits/spend`: Spend credits (requires auth token)
- `POST /api/credits/grant`: Grant credits (requires admin key)
- `GET /api/me/entitlements`: Get user's credits and subscriptions

### Example Endpoint

- `POST /api/example/use-credits`: Example AI feature using credits

## Credit Flow

1. **Purchase Flow**:
   ```
   User → Checkout → Stripe → Webhook → Grant Credits → Database
   ```

2. **Usage Flow**:
   ```
   User → AI Feature → Check Balance → Spend Credits → Execute Feature
   ```

3. **Subscription Flow**:
   ```
   Stripe → Monthly Renewal → Webhook → Grant Monthly Credits
   ```

## Testing

### Local Testing with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
```

### Test Credit System

1. Create a test user account
2. Use Stripe test card: `4242 4242 4242 4242`
3. Purchase credits
4. Try the example AI feature
5. Check credit deduction

## Troubleshooting

### Common Issues

1. **Credits not granted after payment**:
   - Check webhook secret is correct
   - Verify webhook endpoint is accessible
   - Check Stripe webhook logs

2. **Insufficient credits error**:
   - Verify user has enough credits
   - Check idempotency key isn't reused

3. **Subscription not renewing**:
   - Ensure webhook handles `customer.subscription.updated`
   - Check subscription status in Stripe

### Debug Commands

```bash
# Check user's credit balance
SELECT SUM(delta) FROM CreditLedger WHERE userId = 'USER_ID';

# View recent credit transactions
SELECT * FROM CreditLedger WHERE userId = 'USER_ID' ORDER BY createdAt DESC;

# Check active subscriptions
SELECT * FROM Subscription WHERE userId = 'USER_ID' AND status = 'active';
```

## Security Considerations

1. **API Token Generation**: Tokens expire after 60 seconds for internal calls
2. **Idempotency**: Prevents duplicate credit spending
3. **Admin Endpoints**: Protected by secret key
4. **Webhook Verification**: Stripe signature validation
5. **Transaction Atomicity**: Database transactions prevent race conditions

## Future Enhancements

- [ ] Credit expiration dates
- [ ] Bulk credit purchases with discounts
- [ ] Team/organization credit pools
- [ ] Credit transfer between users
- [ ] Detailed usage analytics
- [ ] Metered billing for high-volume users
- [ ] Credit notifications (low balance alerts)

## Support

For questions or issues:
- Check Stripe Dashboard for payment issues
- Review webhook logs for integration problems
- Contact support for credit discrepancies
