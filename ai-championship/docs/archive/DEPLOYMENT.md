# Deployment Guide - HireVision AI

## Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import from GitHub: `https://github.com/developerrrdeepak/hired`
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `ai-championship`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 3: Environment Variables

Add these environment variables in Vercel dashboard (Settings → Environment Variables):

#### Firebase
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

#### Raindrop
- `RAINDROP_API_KEY`
- `RAINDROP_MCP_BASE_URL`

#### Vultr
- `VULTR_POSTGRES_CONNECTION_STRING`
- `VULTR_API_KEY`
- `VULTR_OBJECT_STORAGE_BUCKET`

#### Google Gemini AI
- `GOOGLE_GENAI_API_KEY`

#### Stripe
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### ElevenLabs
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`

### Step 4: Deploy

Click "Deploy" and Vercel will automatically build and deploy your application.

### Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Troubleshooting

### Build Errors
- Check environment variables are set correctly
- Ensure all dependencies are in package.json
- Review build logs in Vercel dashboard

### Runtime Errors
- Check Function Logs in Vercel dashboard
- Verify API keys are valid
- Ensure database connections are accessible from Vercel IPs

## Post-Deployment

1. Test authentication flow
2. Verify database connections
3. Test file uploads to Vultr Object Storage
4. Check AI features (Gemini, ElevenLabs)
5. Monitor performance in Vercel Analytics
