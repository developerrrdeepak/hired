# HireVision: The Next-Gen AI Recruiter (Gemini 3 Hackathon Entry)

## Project Overview
HireVision is a multimodal recruitment platform that transforms hiring from a manual slog into an intelligent, high-speed experience. Built with **Gemini 3.0 Flash**, it mimics human intuition at scale, solving the "40 hours per hire" problem for startups.

### Gemini 3 Integration (The Core)
We leverage Gemini 3.0 Flash's distinct capabilities in three central ways:
1. **Multimodal Reasoning (Vision)**: Unlike basic ATS parsers, HireVision "sees" resumes and portfolios using Gemini Vision. It extracts nuanced skills and design quality that text-only scrapers miss.
2. **Adaptive AI Interviewing (Reasoning)**: Our Interview Engine uses Gemini's advanced reasoning to conduct non-scripted, technical interviews. It probes deeper into candidate answers, assesses logic, and identifies vague responses in real-time.
3. **High-Context Culture Matching**: With the massive 1M+ context window, we analyze entire interview transcripts and multi-page portfolios to score candidate alignment with company values and soft skills.

By reducing latency and unlocking multimodal inputs, HireVision provides a human-quality assessment in seconds, making elite-level recruiting accessible to tiny teams.

## Key Features
- **Ultra-Fast AI Interviewer**: Conducts adaptive technical interviews with natural conversation flow.
- **Vision-Powered Resume Analysis**: Analyzes layouts and creative portfolios beyond simple text.
- **Intelligent Culture Fit Matching**: Holistic "Gemini Score" combining technical and behavioral fit.
- **Real-Time Analytics Dashboard**: Visual hiring pipeline with AI-generated process insights.

## How to Run
1. Clone the repository.
2. Navigate to `hirevision` directory.
3. Install dependencies: `npm install --legacy-peer-deps`
4. Set your `GOOGLE_GENAI_API_KEY` in `.env.local`.
5. Run: `npm run dev`

## Tech Stack
- **Frontend**: Next.js 15, TailwindCSS, Radix UI
- **AI Core**: **Google Gemini 3.0 Flash**
- **Backend**: Firebase / Next.js API Routes
- **Voice**: ElevenLabs Integration (Gemini-driven reasoning)

## Documentation & Links
- **Architecture**: [View ARCHITECTURE.md](./hirevision/docs/ARCHITECTURE.md)
- **Demo Video**: [Your Demo Link Here]
- **Live App**: [Your Live App Link Here]
