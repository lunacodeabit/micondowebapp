# Email Notifications Setup - MI CONDO

## Architecture
```
Frontend (React) → supabase.functions.invoke('send-email') → Supabase Edge Function → Resend API → Email delivered
```

## Setup Steps

### 1. Create Resend account
- Go to https://resend.com/signup
- Verify your domain (micondo.app) in Resend dashboard
- Copy your API key (starts with `re_`)

### 2. Install Supabase CLI (if not installed)
```bash
npm install -g supabase
```

### 3. Link to your project
```bash
cd micondowebapp
supabase login
supabase link --project-ref kttrzritomsfnqfwiplv
```

### 4. Set secrets
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
supabase secrets set FROM_EMAIL="MI CONDO <noreply@micondo.app>"
```

### 5. Deploy the Edge Function
```bash
supabase functions deploy send-email --no-verify-jwt
```

### 6. Test
```bash
curl -X POST "https://kttrzritomsfnqfwiplv.supabase.co/functions/v1/send-email" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","html":"<p>Hello</p>"}'
```

## What's Wired Up

| Event | Email Sent | Triggered From |
|-------|-----------|----------------|
| Payment recorded (per-company modal) | Payment Confirmation | SuperAdminDashboard `handleSubmitPayment()` |
| Payment recorded (billing tab) | Payment Confirmation | SuperAdminDashboard `handleRegisterPayment()` |

## Available Templates (ready to wire)

| Template | Function | Use Case |
|----------|----------|----------|
| Payment Confirmation | `notifyPaymentConfirmation()` | ✅ Wired |
| Payment Reminder | `notifyPaymentReminder()` | Ready for cron/scheduler |
| Welcome | `notifyWelcome()` | Wire to company creation |
| Grace Period Warning | `notifyGracePeriodWarning()` | Wire to billing status check |
| Account Suspended | `notifyAccountSuspended()` | Wire to suspension flow |
| Announcement | `notifyAnnouncement()` | Wire to communications tab |

## Files Modified
- `src/utils/email.ts` - Updated sendEmail() to use Edge Function
- `src/services/emailNotifications.ts` - NEW: High-level notification service
- `src/views/admin/SuperAdminDashboard.tsx` - Wired payment confirmation emails
- `supabase/functions/send-email/index.ts` - NEW: Edge Function for Resend
