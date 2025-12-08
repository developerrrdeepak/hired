# Deployment Guide

## Prerequisites

- Node.js 18+
- Firebase project
- Vercel account (or Netlify)
- Environment variables configured

## Environment Variables

Create `.env.local` with:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI
GOOGLE_GENAI_API_KEY=your_gemini_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key

# WorkOS
WORKOS_API_KEY=your_workos_key
```

## Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

Or use GitHub integration:
1. Connect repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

## Deploy to Netlify

1. Build: `npm run build`
2. Deploy: `netlify deploy --prod`

## Firebase Setup

1. Initialize Firebase: `firebase init`
2. Deploy Firestore rules: `firebase deploy --only firestore:rules`
3. Deploy storage rules: `firebase deploy --only storage`

## Post-Deployment

1. Test all features
2. Monitor error logs
3. Set up analytics
4. Configure CDN
5. Enable caching

## Rollback

```bash
vercel rollback
```

## Monitoring

- Check Vercel Analytics
- Monitor Firebase usage
- Track API errors
- Review performance metrics
