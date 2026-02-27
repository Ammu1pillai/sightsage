# SightSage - Voice-First Medicine Scanner for Visually Impaired 👁️🗣️

SightSage is an innovative, voice-first Progressive Web App (PWA) designed specifically for elderly and visually impaired users. It leverages Groq's powerful Llama 4 Scout vision model to identify medicines, check expiry dates, detect interactions, and provide emergency assistance - all through simple voice commands.

## 🌟 Key Features

### 📸 **Smart Medicine Scanning** (Features 1-5)
- Point camera at any medicine packaging
- Automatic medicine name recognition
- Expiry date extraction
- Active ingredients identification
- Safety warnings and precautions
- Physical description (color, shape, markings)

### 🔍 **Medicine Comparison** (Features 6-9)
- Compare two medicines for interactions
- Detect shared ingredients
- Interaction warnings (Critical/Caution/Safe)
- Dosage spacing recommendations
- Overall safety assessment

### 🗣️ **Voice-First Interface** (Features 10-14)
- Voice commands: "Scan this", "Compare", "Read warnings"
- Voice feedback for all actions
- Text input fallback for noisy environments
- Continuous listening mode
- Natural language processing

### 🆘 **Emergency Features** (Features 15-18)
- One-tap SOS button
- Triple-tap detection for quick emergency access
- Emergency information display with current medicines
- Expiry date monitoring with alerts
- Critical interaction warnings

### 💊 **Medicine Cabinet** (Features 19-21)
- Automatic history of scanned medicines
- Expiry tracking with visual indicators
- Quick access to recent medicines
- Persistent storage via localStorage
- Cabinet management

### ♿ **Accessibility First** (Features 22-24)
- **High Contrast Mode** - Yellow on black for maximum visibility
- **Large Text Mode** - 200% text size option
- **Adjustable Voice Speed** - 5 speed levels (0.5x to 1.5x)
- Screen reader optimized
- Keyboard navigation support

## 🚀 Live Demo

Try SightSage live: [https://sightsage.app](https://sightsage.app) (coming soon)

## 📱 Installation as PWA

SightSage can be installed on any device as a Progressive Web App:

### On Android:
1. Open Chrome and navigate to SightSage
2. Tap the menu (3 dots)
3. Select "Add to Home screen"
4. Name the app and tap "Add"

### On iOS:
1. Open Safari and navigate to SightSage
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Name the app and tap "Add"

### On Desktop:
1. Open Chrome/Edge and navigate to SightSage
2. Click the install icon in the address bar
3. Click "Install"

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI Model**: Groq Llama 4 Scout (17B parameters)
- **APIs**: 
  - Web Speech API (Voice recognition)
  - Speech Synthesis API (Voice output)
  - MediaDevices API (Camera access)
- **Storage**: localStorage for medicine cabinet
- **PWA**: Service Worker for offline caching
- **Styling**: Glassmorphism with gradient effects

## 📋 Prerequisites

- Modern browser with support for:
  - WebRTC (camera access)
  - Web Speech API
  - Service Workers
  - ES6 Modules
- Groq API key (included in demo, but replace for production)
- HTTPS connection (required for camera and voice features)

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sightsage.git
   cd sightsage