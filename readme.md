# SightSage
## Voice-First Medicine Scanner for Elderly & Visually Impaired

## Basic Details
### Team Name: [Code Knot]

### Team Members
- **Member 1:** Pillai Anjita - [School of Engineering,CUSAT]
- **Member 2:** Gopika T P - [School of Engineering,CUSAT]

### Hosted Project Link
[https://sightsage.vercel.app](https://sightsage.vercel.app)

## Project Description
SightSage is a voice-first medicine scanner that helps elderly and visually impaired users identify medicines, check expiry dates, detect drug interactions, and access emergency assistance—all through simple voice commands. The app uses Groq's Llama 4 Scout 17B vision model to analyze medicine packaging and provide instant, accessible information.

## The Problem Statement
Millions of elderly and visually impaired people struggle to read small text on medicine labels, track expiry dates, and identify potential drug interactions. This leads to medication errors, missed doses, and dangerous drug combinations, especially for those managing multiple prescriptions.

## The Solution
SightSage replaces visual reading with an intuitive voice + AI interface. Users simply point their phone camera at any medicine, and the app instantly reads aloud all critical information including medicine name, expiry status, dosage instructions, and safety warnings. The medicine comparison feature helps prevent dangerous drug interactions by analyzing two medicines together and providing clear YES/NO answers with clinical explanations and emergency protocols.

## Technical Details

### Technologies/Components Used

**For Software:**

- **Languages used:** HTML5, CSS3, JavaScript (ES6+)
- **Frameworks used:** No frameworks - pure vanilla JavaScript
- **Libraries used:** Web Speech API (SpeechRecognition), Speech Synthesis API, MediaDevices API
- **Tools used:** VS Code, Git, Groq API (Llama 4 Scout 17B), Vercel for deployment, Chrome DevTools
- **AI Model:** meta-llama/llama-4-scout-17b-16e-instruct (Vision + Text)

### Features

- **Smart Medicine Scanning** – AI identifies medicines from packaging, extracts expiry dates with prominent warnings, provides physical descriptions, and delivers elderly-specific advice and heart patient considerations

- **Medicine Comparison** – Detects interactions with clear YES/NO answers, provides risk assessment (HIGH/MEDIUM/CAUTION/SAFE), explains clinical reasoning, and includes emergency protocols with country-specific numbers (108 India / 911 US)

- **Voice-First Interface** – Supports voice commands like "Scan this", "Read warnings", and "Compare medicines", with automatic voice feedback and continuous 10-second listening

- **Emergency Features** – One-tap SOS button, triple-tap anywhere for emergency mode, medicine history with expiry tracking, and ready-to-show doctor reports with "Bring actual medicine packets" reminder

- **Accessibility First** – High contrast mode (yellow on black, WCAG AAA), 200% large text toggle, adjustable voice speed (0.5x to 1.5x), screen reader optimization, and full keyboard navigation

## Implementation

### Installation

```bash
# Clone the repository
git clone https://github.com/Ammu1pillai/sightsage.git
cd sightsage

# Get a Groq API Key from https://console.groq.com

# Configure the API key in app.js (line 11)
# this.API_KEY = 'your-groq-api-key-here';

# Serve the files locally using any static server
python -m http.server 8000
# OR
npx http-server
```

### Run
```
# Open in browser
http://localhost:8000

# For production deployment
# Push to GitHub and connect to Vercel for automatic deployment
```

## Project Documentation

### Screenshots

[Main Front Page]https://drive.google.com/file/d/16hdiKDGEl5euUNcv73T7er_TaNdiuh8V/view?usp=sharing
*Main page showing the UI interface 

[Medicine Scan Interface]https://drive.google.com/file/d/1XZ9SB-vcaVXvLYSgcLizJAjXiZ2XsyEO/view?usp=drive_link
*Main scanning interface showing camera view with medicine detection and voice command button*

[Accessibility Controls]https://drive.google.com/file/d/1rtSF_kJjAEGU8Xh5JCsCaoBLs571HNc5/view?usp=sharing
*Accessibility panel with high contrast mode, large text toggle, and voice speed controls*

### Diagrams

#### System Architecture

```
https://drive.google.com/file/d/1GM2a_cf6Wy8GZaIMn2GRmcAxRh__3lek/view?usp=sharing

*Architecture Diagram: The system captures camera frames, sends them to Groq's Llama 4 Scout for analysis, processes the response for expiry detection and interaction checking, stores history in localStorage, and provides voice feedback through Web Speech API*

#### Application Workflow

```
https://drive.google.com/file/d/1ubKzJD9l8gxD37SQGTjL4FLQBKN2jho_/view?usp=drive_link
*Workflow: User gives voice command → Camera opens and captures image → Frame sent to Groq API → AI analyzes and returns medicine details → System checks expiry and shows warnings → Results stored in cabinet → Voice reads aloud results*

### API Documentation

**Base URL:** `https://api.groq.com/openai/v1`

#### Endpoints

**POST /chat/completions**

*Description:* Sends medicine image for AI analysis

**Headers:**
```
Authorization: Bearer [API_KEY]
Content-Type: application/json
```

**Request Body:**
```json
{
  "model": "meta-llama/llama-4-scout-17b-16e-instruct",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "You are SightSage, a caring medicine assistant. Look at this medicine image and tell me about it. ⚠️ CRITICAL RULE: If the expiry date has passed, your VERY FIRST WORDS MUST BE 'DO NOT TAKE THIS MEDICINE - IT HAS EXPIRED'."
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,[BASE64_IMAGE]"
          }
        }
      ]
    }
  ],
  "temperature": 0.4,
  "max_tokens": 800
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "content": "MEDICINE NAME: [medicine name]\nEXPIRY DATE: [date or NOT VISIBLE]\nAPPEARANCE: [description]\nUSES: [indications]\nHOW TO TAKE: [instructions]\nCOMMON SIDE EFFECTS: [list]\nELDERLY ADVICE: [special considerations]\nHEART PATIENTS: [what to know]\nAVOID: [foods/drugs to avoid]\nSAFETY TIP: [practical advice]"
      }
    }
  ]
}
```

### Project Demo

#### Video
(https://drive.google.com/file/d/1DtjYuM8YVGnk3qZ0OVzmhw7mPuoAsYCB/view?usp=drive_link)

*The video demonstrates the complete user journey: opening the app, using voice commands to scan a medicine, receiving expiry warnings, comparing two medicines for interactions, and accessing the emergency SOS feature. It highlights the voice-first interface and accessibility features throughout.*

#### Additional Demos
- **Live Site:** [https://sightsage.vercel.app](https://sightsage.vercel.app)
- **GitHub Repository:** [https://github.com/Ammu1pillai/sightsage.git](https://github.com/Ammu1pillai/sightsage.git)
- **Camera Debug Tool:** `/camera-debug.html` (included in repository for troubleshooting)

### AI Tools Used

**Tool Used:** Groq,deepseek

**Purpose:**
- Generated boilerplate code for camera handling and WebRTC implementation
- Debugging assistance for async/await patterns in speech recognition
- Optimizing the prompt engineering for better medicine extraction results
- Code review and accessibility improvements

**Key Prompts Used:**
- "Create a function to handle camera stream with fallback constraints for mobile devices"
- "Debug this speech recognition code that stops working after first command"
- "Optimize the expiry date parsing logic to handle multiple date formats"
- "Generate ARIA labels for screen reader compatibility"

**Percentage of AI-generated code:** Approximately 75%

**Human Contributions:**
- Architecture design and system planning
- UI/UX design decisions for elderly users
- Integration of Groq API and response parsing
- Accessibility testing and improvements
- Medicine comparison logic and emergency protocol design

### Team Contributions

- **Pillai Anjita:** Lead Developer, AI Integration - Implemented Groq API connection, camera handling, voice recognition, and medicine comparison logic. Built the core application architecture and deployed on Vercel.

- **Gopika T P:** UI/UX Designer, Accessibility - Designed the glassmorphism interface, implemented high contrast mode, large text toggle, and voice speed controls. Created the medicine cabinet and emergency features. Ensured WCAG AAA compliance throughout.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ at TinkerHub**