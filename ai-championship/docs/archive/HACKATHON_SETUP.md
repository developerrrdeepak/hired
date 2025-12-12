# AI Championship Hackathon Setup Guide

## ✅ Requirements Checklist

### 1. Raindrop MCP Server Setup

#### Step 1: Install Raindrop MCP Server
```bash
# Install the Raindrop MCP Server globally
npm install -g @raindrop-ai/mcp-server

# Or run it locally
npx @raindrop-ai/mcp-server
```

#### Step 2: Start Raindrop MCP Server
```bash
# Start the MCP server (default port 3001)
raindrop-mcp-server --port 3001

# Or with custom configuration
raindrop-mcp-server --port 3001 --api-key YOUR_RAINDROP_API_KEY
```

#### Step 3: Configure Environment Variables
Add to your `.env.local`:
```env
RAINDROP_API_KEY=your_actual_raindrop_api_key_from_liquidmetal
RAINDROP_MCP_BASE_URL=http://localhost:3001
```

### 2. Vultr Services Setup

#### Option A: Vultr Object Storage (Recommended - Easiest)
1. Go to Vultr Dashboard → Object Storage
2. Create a new Object Storage subscription
3. Get your credentials:
   - Access Key
   - Secret Key
   - Hostname (e.g., `ewr1.vultrobjects.com`)
4. Update `.env.local`:
```env
VULTR_API_KEY=your_vultr_api_key
VULTR_S3_ENDPOINT=https://ewr1.vultrobjects.com
VULTR_S3_ACCESS_KEY=your_access_key
VULTR_S3_SECRET_KEY=your_secret_key
VULTR_S3_REGION=ewr1
VULTR_OBJECT_STORAGE_BUCKET=hirevision-resumes
```

#### Option B: Vultr Managed Database (PostgreSQL)
1. Go to Vultr Dashboard → Databases
2. Create a PostgreSQL database
3. Get connection string
4. Update `.env.local`:
```env
VULTR_POSTGRES_CONNECTION_STRING=postgresql://user:pass@host:port/db
```

#### Option C: Vultr Compute Instance
1. Deploy a compute instance
2. Use it to host your backend services
3. Update `.env.local`:
```env
VULTR_API_KEY=your_vultr_api_key
```

### 3. ElevenLabs Setup (For Voice Agent Category)

1. Sign up at https://elevenlabs.io
2. Get your API key from dashboard
3. Choose a voice ID (or use default: `EXAVITQu4vr4xnSDxMaL`)
4. Update `.env.local`:
```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
```

### 4. Google Gemini AI Setup

1. Go to https://makersuite.google.com/app/apikey
2. Create an API key
3. Update `.env.local`:
```env
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

## 🚀 Quick Start

1. **Install dependencies:**
```bash
cd ai-championship
npm install
```

2. **Start Raindrop MCP Server (in separate terminal):**
```bash
raindrop-mcp-server --port 3001
```

3. **Run the application:**
```bash
npm run dev
```

4. **Test the integrations:**
- Visit http://localhost:9002/raindrop-showcase
- Test each Smart Component
- Verify Vultr storage works
- Test ElevenLabs voice features

## 📝 Submission Requirements

### Required Files:
1. ✅ Live deployed app URL (deploy to Netlify)
2. ✅ Source code (GitHub repo - already done)
3. ✅ Demo video (max 3 minutes)
4. ✅ Project description

### Demo Video Must Show:
- App functioning as intended
- Raindrop MCP Server integration working
- Vultr services being used
- ElevenLabs voice features (if competing in Voice Agent category)

### Deploy to Netlify:
```bash
# Build the app
npm run build

# Deploy (Netlify will auto-deploy from GitHub)
# Make sure environment variables are set in Netlify dashboard
```

## 🎯 Categories You Can Compete In

Based on your app features:

1. ✅ **Best Overall Idea** - Automatic entry
2. ✅ **Audience Favourite** - Automatic entry
3. ✅ **Best Voice Agent** - You have ElevenLabs integration
4. ✅ **Best Small Startup Agents** - AI recruitment assistant
5. ✅ **Best AI App by a Solopreneur** - If you're solo

## 🔍 Verification Checklist

Before submitting, verify:

- [ ] Raindrop MCP Server is running and connected
- [ ] At least one Vultr service is integrated and working
- [ ] ElevenLabs voice features work (if competing in Voice Agent)
- [ ] App is deployed and publicly accessible
- [ ] Demo video is recorded and uploaded
- [ ] All environment variables are set in production
- [ ] GitHub repo is public with open source license

## 📞 Support

- Discord: LiquidMetal Discord #ai-champion-ship
- Documentation: Check Raindrop and Vultr docs
- Office Hours: Join community office hours

## 🏆 Good Luck!

Remember: The deadline is December 7, 2025!
