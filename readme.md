# SightSage 👁️🗣️
## Voice-First Medicine Scanner for Elderly & Visually Impaired

[![Made with Groq](https://img.shields.io/badge/Made%20with-Groq-3b82f6.svg)](https://groq.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-14b8a6.svg)](https://web.dev/progressive-web-apps/)
[![Accessibility](https://img.shields.io/badge/Accessibility-AAA-f59e0b.svg)](https://www.w3.org/WAI/)

---

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [How It Works](#how-it-works)
- [Project Demo](#project-demo)
- [Our Team](#our-team)
- [Important Notes](#important-notes)

---

## Overview

**SightSage** is a voice-first medicine scanner built for elderly and visually impaired users. It uses **Groq's Llama 4 Scout** to identify medicines, check expiry dates, detect interactions, and provide emergency assistance—all through simple voice commands.

**Problem:** Millions struggle to read small text on medicine labels, track expiry dates, and identify drug interactions.

**Solution:** Replace visual reading with **voice + AI** for accessible, safe medicine management.

> *"Just point, ask, and let SightSage be your medicine companion."*

---

## Key Features

### 📸 Smart Scanning
- **Instant Recognition** – AI identifies medicine from packaging
- **Expiry Detection** – Automatic alerts for expired medicines
- **Safety Warnings** – Contraindications & precautions

### 🔍 Medicine Comparison
- **Interaction Detection** – Check two medicines for conflicts
- **Risk Assessment** – 🔴 Critical / 🟡 Caution / 🟢 Safe

### 🗣️ Voice-First
- **Voice Commands** – "Scan this", "Read warnings"
- **Voice Feedback** – Results read aloud automatically
- **Text Fallback** – Type when voice isn't suitable

### 🆘 Emergency
- **SOS Button** – One-tap emergency access
- **Triple-Tap Detection** – Tap anywhere 3x for emergency mode
- **Medicine History** – Shows all recent medicines

### 💊 Medicine Cabinet
- **Auto-History** – Last 10 medicines saved locally
- **Expiry Tracking** – Visual alerts in dropdown

### ♿ Accessibility
- **High Contrast Mode** – Yellow on black (WCAG AAA)
- **Large Text Mode** – 200% text size toggle
- **Adjustable Voice Speed** – 0.5x to 1.5x

---

## Tech Stack

```
Frontend: HTML5, CSS3, JavaScript (ES6+)
AI: Groq Llama 4 Scout 17B (Vision + Text)
Voice: Web Speech API (Recognition) + Speech Synthesis
Camera: MediaDevices API + WebRTC
Storage: localStorage
PWA: Service Workers + Manifest.json
Styling: Glassmorphism + Lora/Hind fonts
```

---

## Installation

### Prerequisites
- Modern browser (Chrome 80+, Safari 14+, Edge 80+)
- HTTPS server (or localhost)
- [Groq API Key](https://console.groq.com)

### Quick Start (5 min)

```bash
# Clone repo
git clone https://github.com/yourusername/sightsage.git
cd sightsage

# Add your API key in app.js (line 11)
# this.API_KEY = 'your-groq-api-key';

# Serve locally
python -m http.server 8000
# or
npx http-server

# Open http://localhost:8000
```

### File Structure
```
sightsage/
├── index.html          # Main app
├── styles.css          # All styling
├── app.js              # Application logic
├── manifest.json       # PWA config
├── sw.js               # Service Worker
├── camera-debug.html   # Camera diagnostic tool
└── README.md
```

---

## How It Works

### 3-Step Process
1. **Point** camera at medicine
2. **Tap** "Scan Medicine" (or say "Scan")
3. **Listen** to results read aloud

### AI Prompt Engineering
```javascript
// Critical rule in every scan
"⚠️ If expiry date has passed, FIRST WORDS MUST BE:
'DO NOT TAKE THIS MEDICINE - IT HAS EXPIRED'"
```

### Data Flow
```
Camera → Base64 Image → Groq API → Parse Response → 
Voice Output + Save to Cabinet
```

### API Configuration
- **Model**: `meta-llama/llama-4-scout-17b-16e-instruct`
- **Temperature**: 0.4
- **Max tokens**: 800
- **Image quality**: 0.85 JPEG

---

## Project Demo

### Live Demo
🔗 [https://sightsage.vercel.app](https://sightsage.vercel.app)

### Video Walkthrough
🎥 [Watch Demo](https://youtu.be/your-demo-link)

### Screenshots
| Scan | Results | Emergency |
|------|---------|-----------|
| 📸 Camera view | 📋 Medicine details | 🆘 SOS report |

---

## Camera Debugging

Having camera issues? Open `camera-debug.html` for a 5-step diagnostic:

1. **Check API** – Verify mediaDevices support
2. **List Devices** – Find all cameras
3. **Open Camera** – Test environment mode
4. **Capture Frame** – Draw to canvas
5. **Check Image Data** – Verify frame isn't blank

**Common fixes:** HTTPS required, check permissions, close other apps.

---

## Our Team

| Name | Role |
|------|------|
| **Member 1** | Lead Developer, AI Integration |
| **Member 2** | UI/UX Designer, Accessibility |

---

## Important Notes

### API Limits (Free Tier)
- **Rate**: ~30 requests/minute
- **Tokens**: ~5,000/minute
- **Image size**: ~20MB max

### Best Practices
| For best results | Do this |
|-----------------|---------|
| Scanning | Hold 15-20cm from camera, good lighting |
| Expiry | Ensure "EXP" or date is visible |
| Voice | Quiet environment, speak clearly |

