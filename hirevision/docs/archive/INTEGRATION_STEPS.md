# Quick Integration Steps - DO THIS NOW!

## 🚨 CRITICAL: You need these to qualify for the hackathon

### Step 1: Get Your API Keys (5 minutes)

1. **Raindrop API Key:**
   - Check your email from LiquidMetal AI (StarterKit email)
   - You should have received $500 in Raindrop credits
   - Copy your API key

2. **Vultr API Key:**
   - Go to https://my.vultr.com/settings/#settingsapi
   - Create new API key
   - Copy it

3. **ElevenLabs API Key:**
   - Go to https://elevenlabs.io/app/settings/api-keys
   - Create new API key
   - Copy it

4. **Google Gemini API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Create API key
   - Copy it

### Step 2: Update .env.local (2 minutes)

Replace the placeholder values in your `.env.local`:

```env
# Raindrop MCP Server
RAINDROP_API_KEY=paste_your_actual_raindrop_key_here
RAINDROP_MCP_BASE_URL=http://localhost:3001

# Vultr
VULTR_API_KEY=paste_your_actual_vultr_key_here
VULTR_S3_ENDPOINT=https://ewr1.vultrobjects.com
VULTR_S3_ACCESS_KEY=paste_your_vultr_s3_access_key
VULTR_S3_SECRET_KEY=paste_your_vultr_s3_secret_key
VULTR_S3_REGION=ewr1
VULTR_OBJECT_STORAGE_BUCKET=hirevision-resumes

# ElevenLabs
ELEVENLABS_API_KEY=paste_your_actual_elevenlabs_key_here
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL

# Google Gemini
GOOGLE_GENAI_API_KEY=paste_your_actual_google_key_here
```

### Step 3: Set Up Vultr Object Storage (10 minutes)

**This is the EASIEST Vultr integration:**

1. Go to https://my.vultr.com/objectstorage/
2. Click "Add Object Storage"
3. Choose location (e.g., New Jersey - ewr1)
4. Create it
5. Click on your storage → "S3 Credentials"
6. Copy:
   - Access Key
   - Secret Key
   - Hostname (e.g., `ewr1.vultrobjects.com`)
7. Update your `.env.local` with these values

### Step 4: Install & Run Raindrop MCP Server (5 minutes)

**Option A: Using npx (Easiest)**
```bash
# In a NEW terminal window
npx @raindrop-ai/mcp-server --port 3001 --api-key YOUR_RAINDROP_API_KEY
```

**Option B: Global install**
```bash
npm install -g @raindrop-ai/mcp-server
raindrop-mcp-server --port 3001 --api-key YOUR_RAINDROP_API_KEY
```

**Keep this terminal running!**

### Step 5: Test Everything (5 minutes)

```bash
# In your project terminal
npm run dev
```

Visit these URLs to test:
1. http://localhost:9002/raindrop-showcase - Test all integrations
2. http://localhost:9002/ai-assistant - Test ElevenLabs voice
3. http://localhost:9002/candidates/new - Test Vultr storage

### Step 6: Update Netlify Environment Variables (5 minutes)

1. Go to your Netlify dashboard
2. Site settings → Environment variables
3. Add ALL the variables from your `.env.local`
4. **IMPORTANT:** For production, set:
   ```
   RAINDROP_MCP_BASE_URL=https://your-raindrop-mcp-server-url.com
   ```
   (You'll need to deploy the MCP server somewhere accessible)

### Step 7: Deploy MCP Server to Production (15 minutes)

**Option A: Deploy to Vultr Compute (Recommended)**
```bash
# Create a simple Express server wrapper
# Deploy to Vultr compute instance
# Point RAINDROP_MCP_BASE_URL to it
```

**Option B: Use Raindrop's hosted MCP**
- Check if LiquidMetal provides a hosted MCP endpoint
- Use that URL instead

### Step 8: Create Demo Video (30 minutes)

Record a 3-minute video showing:
1. **Intro (15 sec):** "This is HireVision, an AI recruitment platform"
2. **Raindrop Integration (60 sec):**
   - Show `/raindrop-showcase` page
   - Click each Smart Component demo
   - Show the results
3. **Vultr Integration (30 sec):**
   - Upload a resume
   - Show it's stored in Vultr Object Storage
4. **ElevenLabs Voice (30 sec):**
   - Show AI assistant with voice
   - Play some audio
5. **Key Features (30 sec):**
   - Show candidate matching
   - Show analytics
6. **Outro (15 sec):** "Built with Raindrop MCP, Vultr, ElevenLabs"

Upload to YouTube as unlisted.

### Step 9: Submit to Devpost

1. Go to the hackathon page
2. Fill in:
   - Project name: HireVision AI
   - Tagline: AI-powered recruitment platform
   - Description: (Use your README)
   - Demo URL: Your Netlify URL
   - Video URL: Your YouTube URL
   - GitHub: Your repo URL
3. Select categories:
   - Best Overall Idea ✓
   - Best Voice Agent ✓
   - Best Small Startup Agents ✓
4. Submit!

### Step 10: Also Submit to ElevenLabs Showcase

For Voice Agent category:
1. Go to https://showcase.elevenlabs.io
2. Submit your project there too

## ⏰ Time Estimate: 1-2 hours total

## 🆘 If You Get Stuck

1. Check the Raindrop MCP server is running
2. Verify all API keys are correct
3. Check browser console for errors
4. Join LiquidMetal Discord #ai-champion-ship
5. Ask for help!

## ✅ Final Checklist

- [ ] All API keys obtained and added to .env.local
- [ ] Vultr Object Storage created and configured
- [ ] Raindrop MCP Server running locally
- [ ] App works locally (tested at /raindrop-showcase)
- [ ] Raindrop MCP Server deployed to production
- [ ] Environment variables added to Netlify
- [ ] App deployed to Netlify and working
- [ ] Demo video recorded and uploaded
- [ ] Submitted to Devpost
- [ ] Submitted to ElevenLabs Showcase (if doing Voice Agent)

## 🎯 You Got This!

Your app is 90% ready. Just need to connect the real services!
