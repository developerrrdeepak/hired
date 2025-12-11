# 🎤 Voice Interview Feature - Complete Guide

## Overview
Voice Interview ek **separate feature** hai jo Universal AI Chat se alag hai. Yeh ek realistic interview simulator hai jisme:
- Live video call interface
- Real-time voice conversation
- AI interviewer jo kisi bhi field ke liye adapt karta hai
- Professional interview experience

## 🎯 Key Features

### 1. **Live Video Interface**
- Split-screen layout (AI Interviewer + Your Camera)
- Real-time camera feed
- Professional video call UI
- Visual feedback for speaking/listening

### 2. **Voice Interaction**
- **Speech Recognition**: Tumhari voice ko text mein convert karta hai
- **Text-to-Speech**: AI ka response voice mein aata hai
- **Voice Selection**: Male ya Female voice choose kar sakte ho
- **Fallback**: Agar voice nahi chale toh text input bhi available hai

### 3. **Smart AI Interviewer**
- Kisi bhi field/role ke liye interview conduct karta hai
- Follow-up questions puchta hai
- Tumhare answers ke basis pe adapt karta hai
- Natural conversation flow
- Professional but friendly tone

### 4. **Real-time Features**
- Instant responses
- Live transcription
- Speaking indicators
- Listening animations

## 🚀 How to Use

### Step 1: Access Voice Interview
```
Navigate to: /voice-interview
```

### Step 2: Setup
1. **Select Voice**: Male ya Female interviewer voice choose karo
2. **Allow Permissions**: Camera aur microphone access allow karo
3. **Start Interview**: Koi bhi field/role mention karo

### Step 3: Interview Process
1. AI pehla question puchega
2. Tum answer do (voice ya text se)
3. AI follow-up questions puchega
4. Natural conversation continue hoga

### Step 4: Controls
- 🎤 **Mic Button**: Voice input ke liye
- ⌨️ **Text Input**: Type karke bhi answer de sakte ho
- 🔄 **Reset**: Naya interview start karo
- 💼 **Quick Actions**: Common questions ke shortcuts

## 🔧 Technical Details

### Architecture
```
Voice Interview (Separate Feature)
├── Frontend: /voice-interview/page.tsx
├── API: /api/voice-interview/chat/route.ts
├── AI Model: Google Gemini 1.5 Flash
├── Voice: ElevenLabs + Browser Speech API
└── Video: WebRTC (getUserMedia)
```

### Technologies Used
1. **AI**: Google Gemini for intelligent responses
2. **Voice**: 
   - ElevenLabs API (premium quality)
   - Browser Speech Synthesis (fallback)
3. **Speech Recognition**: Web Speech API
4. **Video**: WebRTC getUserMedia API

### Browser Compatibility
| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| Video | ✅ Full | ✅ Full | ✅ Full |
| Voice Input | ✅ Full | ❌ No | ⚠️ Limited |
| Voice Output | ✅ Full | ✅ Full | ⚠️ Limited |
| Text Fallback | ✅ Yes | ✅ Yes | ✅ Yes |

**Recommendation**: Chrome ya Edge use karo for best experience

## 🎨 UI Components

### Main Interface
```
┌─────────────────────────────────────┐
│  AI Interviewer  │  Your Camera     │
│  (Animated)      │  (Live Feed)     │
├─────────────────────────────────────┤
│  Chat Messages                      │
│  (Conversation History)             │
├─────────────────────────────────────┤
│  Input + Mic + Send                 │
└─────────────────────────────────────┘
```

### Sidebar
- Voice Selection (Male/Female)
- Quick Actions
- AI Features Info
- Interview Tips

## 🔐 Environment Variables Required

```env
# Google AI (for interview responses)
GOOGLE_GENAI_API_KEY=your_gemini_api_key

# ElevenLabs (optional, for premium voice)
ELEVENLABS_API_KEY=your_elevenlabs_key
```

## 📝 API Endpoints

### POST `/api/voice-interview/chat`
**Request:**
```json
{
  "message": "Tell me about yourself",
  "conversationHistory": [
    {"role": "assistant", "content": "Hello!"},
    {"role": "user", "content": "Hi"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Great! Tell me about your experience..."
}
```

## 🎯 Use Cases

### 1. Job Interview Practice
```
User: "I want to practice for a software engineer role"
AI: "Great! Let's start. Tell me about your experience with..."
```

### 2. Any Field/Role
- Software Engineer
- Product Manager
- Data Scientist
- Marketing Manager
- Sales Executive
- Any custom role

### 3. Different Interview Types
- Behavioral questions
- Technical questions
- Situational questions
- Follow-up probing

## 🆚 Difference from Universal AI Chat

| Feature | Voice Interview | Universal AI Chat |
|---------|----------------|-------------------|
| Purpose | Interview Practice | General AI Assistant |
| Interface | Video Call | Chat Window |
| Voice | Real-time conversation | No voice |
| Camera | Live video feed | No camera |
| AI Behavior | Acts as interviewer | General assistant |
| Use Case | Interview prep | Any task |

## 🎓 Interview Tips

1. **Speak Naturally**: Jaise real interview mein bolte ho
2. **Be Specific**: Clear aur detailed answers do
3. **Ask Questions**: Interview ke end mein AI se questions puch sakte ho
4. **Practice Regularly**: Different roles ke liye practice karo
5. **Use Both Modes**: Voice aur text dono try karo

## 🐛 Troubleshooting

### Camera Not Working
- Browser permissions check karo
- HTTPS connection ensure karo
- Dusra browser try karo

### Voice Not Working
- Microphone permissions check karo
- Chrome/Edge use karo
- Text input as fallback use karo

### AI Not Responding
- Internet connection check karo
- API keys verify karo
- Console errors check karo

## 🚀 Future Enhancements

- [ ] Interview recording
- [ ] Performance analytics
- [ ] Multiple interviewer personas
- [ ] Industry-specific questions
- [ ] Real-time feedback
- [ ] Interview scoring
- [ ] Resume-based questions

## 📞 Support

Issues face kar rahe ho? Check karo:
1. Browser console for errors
2. Network tab for API calls
3. Permissions for camera/mic
4. Environment variables

---

**Note**: Yeh feature Universal AI Chat se completely separate hai. Voice Interview specifically interview practice ke liye designed hai with realistic video call experience! 🎯
