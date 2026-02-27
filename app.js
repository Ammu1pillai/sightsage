// SightSage - Complete MVP Implementation with Groq
class SightSage {
    constructor() {
        // Your Groq API key
        this.API_KEY = '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';
        
        // Groq API endpoint (OpenAI-compatible)
        this.API_URL = 'https://api.groq.com/openai/v1/chat/completions';
        
        // Use Llama 4 Scout for vision tasks
        this.VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
        this.TEXT_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
        
        // State management
        this.medicines = {
            current: null,
            compare1: null,
            compare2: null
        };
        this.scanHistory = [];
        this.voiceSpeed = 1;
        this.sosTapCount = 0;
        this.sosTimer = null;
        
        // DOM Elements
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeVoiceCommands();
        this.initializeCamera();
        this.loadHistory();
        
        // Feature 24: Voice Speed Control
        this.voiceSpeed = parseFloat(localStorage.getItem('voiceSpeed')) || 1;
        
        console.log('SightSage initialized with Groq!');
    }

    initializeElements() {
        // Core elements
        this.camera = document.getElementById('camera');
        this.canvas = document.getElementById('captureCanvas');
        this.results = document.getElementById('results');
        this.scanResults = document.getElementById('scanResults');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.medicineCabinet = document.getElementById('medicineCabinet');
        
        // Buttons
        this.scanButton = document.getElementById('scanButton');
        this.compareButton = document.getElementById('compareButton');
        this.sosButton = document.getElementById('sosButton');
        this.voiceButton = document.getElementById('voiceButton');
        this.textInputButton = document.getElementById('textInputButton');
        this.readAloudButton = document.getElementById('readAloudButton');
        
        // Accessibility toggles
        this.highContrastToggle = document.getElementById('highContrastToggle');
        this.textSizeToggle = document.getElementById('textSizeToggle');
        this.voiceSpeedToggle = document.getElementById('voiceSpeedToggle');
        
        // Text input
        this.textInputArea = document.getElementById('textInputArea');
        this.textQuestion = document.getElementById('textQuestion');
        this.submitText = document.getElementById('submitText');
        
        // Comparison elements
        this.comparisonMode = document.getElementById('comparisonMode');
        this.captureForCompare1 = document.getElementById('captureForCompare1');
        this.captureForCompare2 = document.getElementById('captureForCompare2');
        this.performComparison = document.getElementById('performComparison');
        this.comparisonResults = document.getElementById('comparisonResults');
        
        // Emergency
        this.emergencyOverlay = document.getElementById('emergencyOverlay');
        this.emergencyDetails = document.getElementById('emergencyDetails');
        this.dismissEmergency = document.getElementById('dismissEmergency');
    }

    initializeEventListeners() {
        // Core scanning
        this.scanButton.addEventListener('click', () => {
            console.log('Scan button clicked');
            this.captureAndAnalyze('scan');
        });
        
        this.compareButton.addEventListener('click', () => {
            console.log('Compare button clicked');
            this.toggleComparisonMode();
        });
        
        this.sosButton.addEventListener('click', () => {
            console.log('SOS button clicked');
            this.handleSOS();
        });
        
        // Voice and text
        this.voiceButton.addEventListener('click', () => this.startVoiceRecognition());
        this.textInputButton.addEventListener('click', () => this.toggleTextInput());
        this.submitText.addEventListener('click', () => this.processTextQuestion());
        this.textQuestion.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processTextQuestion();
        });
        
        // Read aloud
        this.readAloudButton.addEventListener('click', () => {
            if (this.scanResults.textContent) {
                this.speak(this.scanResults.textContent);
            }
        });
        
        // Accessibility
        this.highContrastToggle.addEventListener('click', () => this.toggleHighContrast());
        this.textSizeToggle.addEventListener('click', () => this.toggleLargeText());
        this.voiceSpeedToggle.addEventListener('click', () => this.toggleVoiceSpeed());
        
        // Comparison
        this.captureForCompare1.addEventListener('click', () => this.captureForComparison(1));
        this.captureForCompare2.addEventListener('click', () => this.captureForComparison(2));
        this.performComparison.addEventListener('click', () => this.compareMedicines());
        
        // Emergency dismiss
        this.dismissEmergency.addEventListener('click', () => this.hideEmergency());
        
        // Triple-tap SOS (Feature 17)
        document.addEventListener('click', () => this.detectTripleTap());
    }

    // ============== CAMERA FUNCTIONS ==============
    async initializeCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            this.camera.srcObject = stream;
            console.log('Camera initialized');
        } catch (err) {
            console.error('Camera error:', err);
            this.showError('Camera access needed for scanning');
        }
    }

    async captureImage() {
        // Ensure video is ready
        if (!this.camera.videoWidth) {
            await new Promise(resolve => {
                this.camera.onloadedmetadata = () => resolve();
            });
        }
        
        this.canvas.width = this.camera.videoWidth;
        this.canvas.height = this.camera.videoHeight;
        const context = this.canvas.getContext('2d');
        context.drawImage(this.camera, 0, 0);
        
        // Get base64 image (resize to stay under Groq's 4MB limit) [citation:2]
        const imageData = this.canvas.toDataURL('image/jpeg', 0.6);
        return imageData;
    }

    // ============== GROQ AI ANALYSIS ==============
    async analyzeMedicine(imageData, context = 'scan') {
        const base64Image = imageData.split(',')[1];
        
        const prompt = context === 'scan' 
            ? `You are a medicine identification assistant. Analyze this medicine image and provide EXACTLY this information:
               1. Medicine name (what is this medicine?)
               2. Expiry date if visible (format as DD/MM/YYYY or "Not visible")
               3. Active ingredients list (main ingredients)
               4. Basic warnings (e.g., "Contains acetaminophen", "No alcohol", "May cause drowsiness")
               5. Physical description (color, shape, markings, bottle type)
               
               Format your response clearly with each section on a new line starting with the number.`
            : `Analyze this medicine image for comparison. Extract the medicine name and active ingredients only.`;

        try {
            console.log('Sending to Groq...');
            this.voiceStatus.textContent = "🔍 Analyzing with Groq...";
            
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: this.VISION_MODEL,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: prompt
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 1024
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Groq API error:', response.status, errorText);
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Groq response:', data);
            
            if (!data.choices || !data.choices[0]) {
                throw new Error('Invalid response format');
            }
            
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('Groq analysis error:', error);
            return `Error analyzing image: ${error.message}. Please try again.`;
        }
    }

    async captureAndAnalyze(mode = 'scan') {
        try {
            this.voiceStatus.textContent = "📸 Capturing image...";
            const imageData = await this.captureImage();
            
            this.voiceStatus.textContent = "🔍 Analyzing with Groq...";
            const analysis = await this.analyzeMedicine(imageData, mode);
            
            // Parse and store medicine info
            const medicineInfo = this.parseMedicineInfo(analysis);
            
            if (mode === 'scan') {
                this.medicines.current = medicineInfo;
                this.displayResults(analysis);
                this.saveToHistory(medicineInfo);
                
                // Check expiry (Feature 15)
                if (medicineInfo.expiry && this.isExpired(medicineInfo.expiry)) {
                    this.showEmergency('⚠️ EXPIRED MEDICINE - DO NOT TAKE');
                }
                
                // Speak the result
                this.speak(`Analysis complete. ${medicineInfo.name}`);
            }
            
            return medicineInfo;
            
        } catch (error) {
            console.error('Capture error:', error);
            this.displayResults(`Error: ${error.message}`);
        }
    }

    parseMedicineInfo(analysis) {
        // Simple parsing
        return {
            name: this.extractField(analysis, 1) || 'Unknown',
            expiry: this.extractField(analysis, 2) || null,
            ingredients: this.extractField(analysis, 3) || '',
            warnings: this.extractField(analysis, 4) || '',
            description: this.extractField(analysis, 5) || ''
        };
    }

    extractField(text, fieldNumber) {
        const patterns = [
            new RegExp(`${fieldNumber}\\.?\\s*([^\\n]+)`),  // "1. Medicine name"
            new RegExp(`${fieldNumber}[:\\)]\\s*([^\\n]+)`, 'i'), // "1: Name" or "1) Name"
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match[1].trim();
        }
        return null;
    }

    // ============== INTERACTIONS (Features 6-9) ==============
    async compareMedicines() {
        if (!this.medicines.compare1 || !this.medicines.compare2) {
            this.speak("Please scan two medicines first");
            return;
        }

        const prompt = `Compare these two medicines for interactions:
                       Medicine 1: ${JSON.stringify(this.medicines.compare1)}
                       Medicine 2: ${JSON.stringify(this.medicines.compare2)}
                       
                       Provide:
                       1. Shared ingredients
                       2. Interaction warning level: Critical vs Caution vs Safe
                       3. Simple advice like "Take 4 hours apart"
                       4. Overall safety assessment`;

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: this.TEXT_MODEL,
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1024
                })
            });

            const data = await response.json();
            const comparison = data.choices[0].message.content;
            
            this.comparisonResults.innerHTML = comparison.replace(/\n/g, '<br>');
            this.comparisonResults.classList.remove('hidden');
            
            if (comparison.toLowerCase().includes('critical')) {
                this.showEmergency('⚠️ CRITICAL INTERACTION DETECTED');
            }
            
            this.speak("Comparison complete. " + comparison.substring(0, 100));
        } catch (error) {
            this.comparisonResults.innerHTML = "Error comparing medicines";
        }
    }

    // ============== VOICE FUNCTIONS ==============
    initializeVoiceCommands() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.voiceStatus.textContent = "Voice not supported in this browser";
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
            this.voiceStatus.textContent = `Heard: "${command}"`;
            
            if (command.includes('scan this') || command.includes('scan')) {
                this.captureAndAnalyze('scan');
            } else if (command.includes('compare these') || command.includes('compare')) {
                this.toggleComparisonMode();
            } else if (command.includes('read warnings')) {
                if (this.scanResults.textContent) {
                    this.speak(this.scanResults.textContent);
                }
            } else if (command.includes('emergency') || command.includes('help')) {
                this.handleSOS();
            }
        };

        this.recognition.onerror = () => {
            this.voiceStatus.textContent = "Voice recognition error. Try typing.";
        };
    }

    startVoiceRecognition() {
        try {
            this.recognition.start();
            this.voiceStatus.textContent = "🎤 Listening... Say a command";
            setTimeout(() => {
                this.recognition.stop();
                this.voiceStatus.textContent = "Voice mode ready";
            }, 10000);
        } catch (e) {
            this.voiceStatus.textContent = "Click 'Type' to ask questions";
        }
    }

    speak(text) {
        if (!text) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.voiceSpeed;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        window.speechSynthesis.speak(utterance);
    }

    toggleTextInput() {
        this.textInputArea.classList.toggle('hidden');
        if (!this.textInputArea.classList.contains('hidden')) {
            this.textQuestion.focus();
        }
    }

    async processTextQuestion() {
        const question = this.textQuestion.value;
        if (!question) return;

        this.voiceStatus.textContent = "Processing question...";
        
        const context = this.medicines.current ? 
            `Current medicine: ${JSON.stringify(this.medicines.current)}` : 
            'No medicine currently scanned';

        const prompt = `Question about medicine safety: "${question}"
                       Context: ${context}
                       Provide a clear, simple answer focusing on safety.`;

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: this.TEXT_MODEL,
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1024
                })
            });

            const data = await response.json();
            const answer = data.choices[0].message.content;
            
            this.displayResults(answer);
            this.speak(answer);
            this.textQuestion.value = '';
            this.textInputArea.classList.add('hidden');
        } catch (error) {
            this.displayResults("Error processing question");
        }
    }

    // ============== EMERGENCY FUNCTIONS ==============
    detectTripleTap() {
        this.sosTapCount++;
        
        if (this.sosTapCount === 1) {
            this.sosTimer = setTimeout(() => {
                this.sosTapCount = 0;
            }, 1000);
        }
        
        if (this.sosTapCount === 3) {
            clearTimeout(this.sosTimer);
            this.sosTapCount = 0;
            this.handleSOS();
        }
    }

    handleSOS() {
        const sosInfo = document.getElementById('sosWarning');
        sosInfo.classList.remove('hidden');
        
        let emergencyText = "🚨 EMERGENCY - Current Medicines:\n";
        
        if (this.medicines.current) {
            emergencyText += `Current: ${this.medicines.current.name}\n`;
        }
        
        const cabinet = JSON.parse(localStorage.getItem('medicineCabinet') || '[]');
        cabinet.forEach(med => {
            emergencyText += `${med.name} (${med.expiry || 'No expiry'})\n`;
        });
        
        this.showEmergency(emergencyText);
        this.speak("SOS activated. Emergency information displayed.");
    }

    showEmergency(message) {
        this.emergencyDetails.innerHTML = message.replace(/\n/g, '<br>');
        this.emergencyOverlay.classList.remove('hidden');
    }

    hideEmergency() {
        this.emergencyOverlay.classList.add('hidden');
        document.getElementById('sosWarning').classList.add('hidden');
    }

    isExpired(expiryDate) {
        if (!expiryDate || expiryDate === 'Not visible') return false;
        const expDate = new Date(expiryDate);
        const today = new Date();
        return expDate < today;
    }

    // ============== HISTORY & CABINET ==============
    saveToHistory(medicine) {
        let cabinet = JSON.parse(localStorage.getItem('medicineCabinet') || '[]');
        
        cabinet.unshift({
            ...medicine,
            scannedAt: new Date().toISOString(),
            expired: medicine.expiry ? this.isExpired(medicine.expiry) : false
        });
        
        cabinet = cabinet.slice(0, 5);
        
        localStorage.setItem('medicineCabinet', JSON.stringify(cabinet));
        this.displayCabinet();
    }

    loadHistory() {
        this.displayCabinet();
    }

    displayCabinet() {
        const cabinet = JSON.parse(localStorage.getItem('medicineCabinet') || '[]');
        
        if (cabinet.length === 0) {
            this.medicineCabinet.innerHTML = '<p>No medicines saved yet. Scan your first medicine!</p>';
            return;
        }
        
        this.medicineCabinet.innerHTML = cabinet.map(med => `
            <div class="medicine-item ${med.expired ? 'expired' : ''}">
                ${med.expired ? '<span class="expired-label">⚠️ EXPIRED ⚠️</span>' : ''}
                <strong>${med.name || 'Unknown'}</strong><br>
                ${med.expiry ? `Expires: ${med.expiry}<br>` : ''}
                ${med.ingredients ? `Ingredients: ${med.ingredients.substring(0, 50)}...<br>` : ''}
                <small>Scanned: ${new Date(med.scannedAt).toLocaleDateString()}</small>
            </div>
        `).join('');
    }

    // ============== UI FUNCTIONS ==============
    displayResults(text) {
        this.scanResults.innerHTML = text.replace(/\n/g, '<br>');
        this.results.classList.remove('hidden');
    }

    toggleComparisonMode() {
        this.comparisonMode.classList.toggle('hidden');
        this.medicines.compare1 = null;
        this.medicines.compare2 = null;
        this.comparisonResults.innerHTML = '';
    }

    async captureForComparison(slot) {
        const medicine = await this.captureAndAnalyze('compare');
        if (slot === 1) {
            this.medicines.compare1 = medicine;
            document.getElementById('medicine1Name').textContent = medicine.name || 'Medicine 1';
        } else {
            this.medicines.compare2 = medicine;
            document.getElementById('medicine2Name').textContent = medicine.name || 'Medicine 2';
        }
    }

    // ============== ACCESSIBILITY ==============
    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
    }

    toggleLargeText() {
        document.body.classList.toggle('large-text');
        localStorage.setItem('largeText', document.body.classList.contains('large-text'));
    }

    toggleVoiceSpeed() {
        const speeds = [0.5, 0.75, 1, 1.25, 1.5];
        const currentIndex = speeds.indexOf(this.voiceSpeed);
        this.voiceSpeed = speeds[(currentIndex + 1) % speeds.length];
        localStorage.setItem('voiceSpeed', this.voiceSpeed);
        
        const speedNames = {0.5: 'Very Slow', 0.75: 'Slow', 1: 'Normal', 1.25: 'Fast', 1.5: 'Very Fast'};
        this.speak(`Voice speed set to ${speedNames[this.voiceSpeed]}`);
    }

    showError(message) {
        this.voiceStatus.textContent = message;
        setTimeout(() => {
            this.voiceStatus.textContent = 'Ready';
        }, 3000);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app...');
    window.app = new SightSage();
});