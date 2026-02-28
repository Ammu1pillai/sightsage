# SightSage  
## Voice-First Medicine Scanner for Elderly & Visually Impaired  

## Overview  

**SightSage** is a voice-first medicine scanner built for elderly and visually impaired users. It uses **Groq's Llama 4 Scout 17B vision model** to identify medicines, check expiry dates, detect interactions, and provide emergency assistance—all through simple voice commands.  

**Problem:** Millions struggle to read small text on medicine labels, track expiry dates, and identify drug interactions.  

**Solution:** Replace visual reading with **voice + AI** for accessible, safe medicine management.  

> *"Just point, ask, and let SightSage be your medicine companion."*  



## Features  

### Smart Medicine Scanning  
- **Instant Medicine Recognition** – AI identifies medicine from packaging  
- **Expiry Date Extraction** – Automatic alerts for expired medicines  
- **Active Ingredients** – Lists ingredients in plain English  
- **Physical Description** – Color, shape, markings for verification  
- **Dosage Information** – Extracts dosage when visible  
- **Safety Warnings** – Contraindications and precautions  

### Medicine Comparison  
- **Interaction Detection** – Compares two medicines for conflicts  
- **Shared Ingredients** – Identifies overlapping active ingredients  
- **Risk Assessment** – Critical / Caution / Safe warnings  
- **Dosage Spacing** – Recommends time gaps between medicines  

### Voice-First Interface  
- **Voice Commands** – "Scan this", "Read warnings", "Compare medicines"  
- **Voice Feedback** – Results read aloud automatically  
- **Continuous Listening** – 10-second active listening window  
- **Text Fallback** – Type questions when voice isn't suitable  

### Emergency Features  
- **SOS Button** – One-tap emergency access  
- **Triple-Tap Detection** – Tap anywhere 3x for emergency mode  
- **Medicine History** – Shows recent medicines with expiry status  
- **Emergency Report** – Ready-to-show doctor with medicine list + timestamp  

### Medicine Cabinet  
- **Auto-History** – Last 10 medicines saved to localStorage  
- **Expiry Tracking** – Visual alerts for expired medicines  
- **Quick Access** – Dropdown to view any previously scanned medicine  

### Accessibility First  
- **High Contrast Mode** – Yellow on black (WCAG AAA)  
- **Large Text Mode** – 200% text size toggle  
- **Adjustable Voice Speed** – 5 speeds from 0.5x to 1.5x  
- **Screen Reader Optimized** – ARIA labels throughout  
- **Keyboard Navigation** – Full keyboard support  



## How AI Generates Content  

### Context Capture  
The app captures the camera frame and converts it to base64 image data.  

### Instruction Injection  
The `analyzeWithGroq()` function sends a crafted prompt to Llama 4 Scout:  

```javascript
const prompt = `You are SightSage, a caring medicine assistant. 
Look at this medicine image and tell me about it.

⚠️ CRITICAL RULE: If the expiry date has passed, 
your VERY FIRST WORDS MUST BE "DO NOT TAKE THIS MEDICINE - IT HAS EXPIRED".

Provide:
MEDICINE NAME: [exact name]
EXPIRY DATE: [exact date or "NOT VISIBLE"]
APPEARANCE: [color, shape, markings]
USES: [what it's used for]
HOW TO TAKE: [with/without food]
COMMON SIDE EFFECTS: [brief list]
ELDERLY ADVICE: [special considerations]
HEART PATIENTS: [what to know]
AVOID: [foods, drinks, medicines to avoid]
SAFETY TIP: [one practical tip]`;
```

### Post-Processing  
```javascript
// Expiry detection
if (medicineInfo.expiry && this.isExpired(medicineInfo.expiry)) {
    this.showEmergency('⚠️ EXPIRED MEDICINE - DO NOT TAKE');
}

// Storage
cabinet.unshift({
    name: medicine.name || 'Unknown',
    expiry: medicine.expiry || null,
    description: medicine.description,
    scannedAt: new Date().toISOString(),
    expired: medicine.expiry ? this.isExpired(medicine.expiry) : false
});
```

### API Configuration  
- **Model**: `meta-llama/llama-4-scout-17b-16e-instruct`  
- **Temperature**: 0.4 (balances creativity and accuracy)  
- **Max tokens**: 800 (sufficient for medicine details)  
- **Image quality**: 0.85 JPEG compression  



## Technology Stack  

### Core Architecture  
```
Frontend: HTML5, CSS3, JavaScript (ES6+)
AI Engine: Groq Llama 4 Scout 17B (Vision + Text)
Voice Input: Web Speech API (SpeechRecognition)
Voice Output: Speech Synthesis API
Camera: MediaDevices API + WebRTC
Storage: localStorage
PWA: Service Workers + Manifest.json
Styling: CSS3 with Glassmorphism
Fonts: Lora (headings) + Hind (body)
```

### Key Integrations  
- **Groq API** – Ultra-fast inference (< 2 seconds per scan)  
- **Llama 4 Scout** – 17B parameter vision-language model  
- **WebRTC** – Camera streaming with fallback constraints  
- **Web Speech** – Cross-browser voice recognition  



## Installation and Setup  

### Prerequisites  
- Modern browser (Chrome 80+, Safari 14+, Edge 80+, Firefox 85+)  
- HTTPS server (or localhost for development)  
- [Groq API Key](https://console.groq.com)  

### Quick Start (5 Minutes)  

```bash
# Clone the repository
git clone https://github.com/yourusername/sightsage.git
cd sightsage

# Get a Groq API Key from https://console.groq.com

# Configure the API key in app.js (line 11)
# this.API_KEY = 'your-groq-api-key-here';

# Serve the files locally
python -m http.server 8000
# OR
npx http-server

# Open in browser
# http://localhost:8000
```

### File Structure  
```
sightsage/
├── index.html          # Main application shell
├── styles.css          # All styling + glassmorphism effects
├── app.js              # Complete application logic
├── manifest.json       # PWA configuration
├── sw.js               # Service Worker for offline
├── camera-debug.html   # Camera troubleshooting tool
└── README.md           # Documentation
```

### PWA Installation  
**Android (Chrome):** Menu → "Add to Home screen"  
**iOS (Safari):** Share button → "Add to Home Screen"  
**Desktop (Chrome/Edge):** Click install icon in address bar  

**Offline Capabilities:** Service Worker caches core files; medicine cabinet available offline  



## Project Demo  

**Live Demo:** [https://sightsage.vercel.app](https://sightsage.vercel.app)  

**Video Walkthrough:** [Watch Demo](https://youtu.be/your-demo-link)  



## Our Team  

| Name | Role |
|------|------|
| Pillai Anjita | Lead Developer, AI Integration |
| Gopika T P | UI/UX Designer, Accessibility |



## GitHub Repository  

**Source Code:** [https://github.com/yourusername/sightsage](https://github.com/yourusername/sightsage)  

**Report Issues:** [https://github.com/yourusername/sightsage/issues](https://github.com/yourusername/sightsage/issues)  



## Important Notes  

### API Limits (Free Tier)  
- **Requests per minute**: ~30  
- **Tokens per minute**: ~5,000  
- **Image size limit**: ~20MB  
- **Security**: Replace demo API key with your own for production  
- **Monitoring**: Usage is tracked; excessive calls may be throttled  

### Best Practices  
| For best results | Do this |
|-----------------|---------|
| Medicine scanning | Hold 15-20 cm from camera, good lighting |
| Expiry detection | Ensure "EXP" or date is clearly visible |
| Voice commands | Quiet environment, speak clearly |
| Comparison | Scan medicines one at a time |

### Disclaimer  
> SightSage provides AI-assisted information to support — not replace — your doctor's advice. Always consult your physician before changing your medication.  



## Camera Debugging  

Having camera issues? Open `camera-debug.html` for a 5-step diagnostic:  

| Step | Action | What It Tests |
|------|--------|---------------|
| Step 1 | Check API | Verifies `navigator.mediaDevices` availability |
| Step 2 | List Devices | Enumerates all cameras on device |
| Step 3 | Open Camera | Tests `environment` facingMode |
| Step 3b | Fallback | Tests with no constraints |
| Step 4 | Capture Frame | Draws video frame to canvas |
| Step 5 | Check Image Data | Verifies frame isn't blank |

### Common Camera Fixes  
```javascript
// If facingMode: 'environment' fails, app automatically falls back to:
{ video: true }

// If camera doesn't initialize, check:
1. HTTPS required (camera needs secure context)
2. Browser permissions (🔒 icon in address bar)
3. No other apps using camera
4. Device has camera hardware
```

## Contributing  

We welcome contributions! Here's how:  

1. **Fork** the repository  
2. **Create** feature branch (`git checkout -b feature/amazing`)  
3. **Commit** changes (`git commit -m 'Add feature'`)  
4. **Push** to branch (`git push origin feature/amazing`)  
5. **Open** a Pull Request  
