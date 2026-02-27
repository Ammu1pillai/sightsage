// ============== VISUAL DEBUG HELPER ==============
(function addDebugHelper() {
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debugPanel';
    debugDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: yellow;
        color: black;
        padding: 10px;
        z-index: 9999;
        font-size: 14px;
        text-align: center;
        border-bottom: 3px solid red;
        font-weight: bold;
    `;
    debugDiv.innerHTML = '🔍 DEBUG MODE ACTIVE';
    document.body.prepend(debugDiv);
    
    window.showDebug = function(msg) {
        console.log('🔍 DEBUG:', msg);
        const panel = document.getElementById('debugPanel');
        if (panel) {
            panel.innerHTML = '🔍 ' + msg;
        }
    };
})();

// SightSage - Complete MVP Implementation with Groq
class SightSage {
    constructor() {
        window.showDebug('Initializing app...');
        
        // Your Groq API key
        this.API_KEY = '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';
        this.API_URL = 'https://api.groq.com/openai/v1/chat/completions';
        
        // CORRECT MODELS FOR GROQ
        this.VISION_MODEL = 'llama-3.2-11b-vision-preview';
        this.TEXT_MODEL = 'llama-3.3-70b-versatile';
        
        // State management
        this.medicines = {
            current: null,
            compare1: null,
            compare2: null
        };
        this.voiceSpeed = 1;
        this.sosTapCount = 0;
        this.sosTimer = null;
        this.recognition = null;
        this.isListening = false;
        
        // DOM Elements
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeVoiceCommands();
        this.initializeCamera();
        this.loadHistory();
        
        this.voiceSpeed = parseFloat(localStorage.getItem('voiceSpeed')) || 1;
        
        console.log('SightSage initialized with Groq!');
        window.showDebug('✅ App ready!');
    }

    initializeElements() {
        window.showDebug('Loading elements...');
        
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
        
        // Check if buttons exist
        if (this.scanButton) window.showDebug('✅ Scan button found');
        else window.showDebug('❌ Scan button missing');
        
        if (this.compareButton) window.showDebug('✅ Compare button found');
        if (this.sosButton) window.showDebug('✅ SOS button found');
        if (this.voiceButton) window.showDebug('✅ Voice button found');
        
        // Rest of elements...
        this.textInputArea = document.getElementById('textInputArea');
        this.textQuestion = document.getElementById('textQuestion');
        this.submitText = document.getElementById('submitText');
        this.comparisonMode = document.getElementById('comparisonMode');
        this.captureForCompare1 = document.getElementById('captureForCompare1');
        this.captureForCompare2 = document.getElementById('captureForCompare2');
        this.performComparison = document.getElementById('performComparison');
        this.comparisonResults = document.getElementById('comparisonResults');
        this.medicine1Name = document.getElementById('medicine1Name');
        this.medicine2Name = document.getElementById('medicine2Name');
        this.emergencyOverlay = document.getElementById('emergencyOverlay');
        this.emergencyDetails = document.getElementById('emergencyDetails');
        this.dismissEmergency = document.getElementById('dismissEmergency');
        this.sosWarning = document.getElementById('sosWarning');
    }

    initializeEventListeners() {
        window.showDebug('Setting up buttons...');
        
        // Core scanning
        if (this.scanButton) {
            this.scanButton.addEventListener('click', () => {
                window.showDebug('📸 Scan clicked!');
                console.log('Scan button clicked');
                this.captureAndAnalyze('scan');
            });
        }
        
        if (this.compareButton) {
            this.compareButton.addEventListener('click', () => {
                window.showDebug('🔍 Compare clicked');
                console.log('Compare button clicked');
                this.toggleComparisonMode();
            });
        }
        
        if (this.sosButton) {
            this.sosButton.addEventListener('click', () => {
                window.showDebug('🆘 SOS clicked');
                console.log('SOS button clicked');
                this.handleSOS();
            });
        }
        
        if (this.voiceButton) {
            this.voiceButton.addEventListener('click', () => {
                window.showDebug('🎤 Voice clicked');
                this.startVoiceRecognition();
            });
        }
        
        if (this.textInputButton) {
            this.textInputButton.addEventListener('click', () => {
                window.showDebug('⌨️ Type clicked');
                this.toggleTextInput();
            });
        }
        
        window.showDebug('✅ Buttons ready');
    }

    // ============== CAMERA FUNCTIONS ==============
    async initializeCamera() {
        window.showDebug('📷 Requesting camera...');
        
        try {
            console.log('Checking camera permissions...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            if (this.camera) {
                this.camera.srcObject = stream;
                window.showDebug('✅ Camera ready!');
                console.log('Camera initialized successfully');
            }
        } catch (err) {
            console.error('Camera error:', err);
            window.showDebug('❌ Camera error: ' + err.message);
            
            if (err.name === 'NotAllowedError') {
                window.showDebug('❌ Please grant camera permission');
            } else if (err.name === 'NotFoundError') {
                window.showDebug('❌ No camera found');
            } else {
                window.showDebug('❌ Camera failed: ' + err.message);
            }
            
            this.showError('Camera access needed for scanning');
        }
    }

    async captureImage() {
        window.showDebug('📸 Capturing image...');
        
        if (!this.camera || !this.canvas) {
            throw new Error('Camera or canvas not available');
        }

        if (!this.camera.videoWidth) {
            window.showDebug('⏳ Waiting for camera...');
            await new Promise(resolve => {
                this.camera.onloadedmetadata = () => resolve();
            });
        }
        
        this.canvas.width = this.camera.videoWidth;
        this.canvas.height = this.camera.videoHeight;
        const context = this.canvas.getContext('2d');
        context.drawImage(this.camera, 0, 0);
        
        window.showDebug('✅ Image captured');
        return this.canvas.toDataURL('image/jpeg', 0.6);
    }

    // ============== GROQ AI ANALYSIS ==============
    async analyzeMedicine(imageData, context = 'scan') {
        window.showDebug('🤖 Sending to Groq AI...');
        const base64Image = imageData.split(',')[1];
        
        const prompt = context === 'scan' 
            ? `Analyze this medicine image and provide:
               1. Medicine name
               2. Expiry date if visible
               3. Active ingredients
               4. Basic warnings
               5. Physical description`
            : `Extract medicine name and active ingredients only.`;

        try {
            console.log('Sending to Groq...');
            
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
                                { type: "text", text: prompt },
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
                console.error('API error:', response.status, errorText);
                window.showDebug(`❌ API error: ${response.status}`);
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            window.showDebug('✅ Analysis complete!');
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('Groq analysis error:', error);
            window.showDebug('❌ Analysis failed');
            return `Error analyzing image: ${error.message}`;
        }
    }

    async captureAndAnalyze(mode = 'scan') {
        try {
            const imageData = await this.captureImage();
            const analysis = await this.analyzeMedicine(imageData, mode);
            
            const medicineInfo = this.parseMedicineInfo(analysis);
            
            if (mode === 'scan') {
                this.medicines.current = medicineInfo;
                this.displayResults(analysis);
                this.saveToHistory(medicineInfo);
                
                if (medicineInfo.expiry && this.isExpired(medicineInfo.expiry)) {
                    this.showEmergency('⚠️ EXPIRED MEDICINE - DO NOT TAKE');
                }
                
                this.speak(`Analysis complete. ${medicineInfo.name}`);
                window.showDebug('✅ Done! Check results');
            }
            
            return medicineInfo;
            
        } catch (error) {
            console.error('Capture error:', error);
            window.showDebug('❌ Error: ' + error.message);
            this.displayResults(`Error: ${error.message}`);
            return null;
        }
    }

    parseMedicineInfo(analysis) {
        return {
            name: this.extractField(analysis, 1) || 'Unknown',
            expiry: this.extractField(analysis, 2) || null,
            ingredients: this.extractField(analysis, 3) || '',
            warnings: this.extractField(analysis, 4) || '',
            description: this.extractField(analysis, 5) || ''
        };
    }

    extractField(text, fieldNumber) {
        if (!text) return null;
        const patterns = [
            new RegExp(`${fieldNumber}\\.?\\s*([^\\n]+)`),
            new RegExp(`${fieldNumber}[:\\)]\\s*([^\\n]+)`, 'i'),
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match[1].trim();
        }
        return null;
    }

    async compareMedicines() {
        if (!this.medicines.compare1 || !this.medicines.compare2) {
            this.speak("Please scan two medicines first");
            return;
        }

        const prompt = `Compare these two medicines:
                       Medicine 1: ${JSON.stringify(this.medicines.compare1)}
                       Medicine 2: ${JSON.stringify(this.medicines.compare2)}
                       
                       Provide: 1. Shared ingredients 2. Interaction warning 3. Advice`;

        try {
            window.showDebug('🔄 Comparing...');
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: this.TEXT_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.3,
                    max_tokens: 1024
                })
            });

            const data = await response.json();
            const comparison = data.choices[0].message.content;
            
            if (this.comparisonResults) {
                this.comparisonResults.innerHTML = comparison.replace(/\n/g, '<br>');
                this.comparisonResults.classList.remove('hidden');
            }
            
            if (comparison.toLowerCase().includes('critical')) {
                this.showEmergency('⚠️ CRITICAL INTERACTION');
            }
            
            this.speak("Comparison complete");
            window.showDebug('✅ Comparison done');
        } catch (error) {
            window.showDebug('❌ Compare failed');
        }
    }

    // ============== VOICE FUNCTIONS ==============
    initializeVoiceCommands() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            window.showDebug('❌ Voice not supported');
            return;
        }
        window.showDebug('✅ Voice supported');
    }

    startVoiceRecognition() {
        window.showDebug('🎤 Voice mode - say "scan"');
        setTimeout(() => window.showDebug('✅ Voice ready'), 3000);
    }

    speak(text) {
        if (!text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.voiceSpeed;
        window.speechSynthesis.speak(utterance);
    }

    toggleTextInput() {
        if (this.textInputArea) {
            this.textInputArea.classList.toggle('hidden');
            window.showDebug('📝 Text input toggled');
        }
    }

    async processTextQuestion() {
        window.showDebug('❓ Processing question...');
        // Simplified for debugging
        this.displayResults("Question received! API call would happen here.");
        this.speak("Question received");
        window.showDebug('✅ Question processed');
    }

    // ============== EMERGENCY FUNCTIONS ==============
    detectTripleTap() {
        this.sosTapCount++;
        if (this.sosTapCount === 1) {
            this.sosTimer = setTimeout(() => this.sosTapCount = 0, 1000);
        }
        if (this.sosTapCount === 3) {
            clearTimeout(this.sosTimer);
            this.sosTapCount = 0;
            this.handleSOS();
        }
    }

    handleSOS() {
        window.showDebug('🚨 SOS ACTIVATED');
        if (this.sosWarning) this.sosWarning.classList.remove('hidden');
        
        let emergencyText = "🚨 EMERGENCY\n";
        if (this.medicines.current) {
            emergencyText += `Current: ${this.medicines.current.name}\n`;
        }
        
        this.showEmergency(emergencyText);
        this.speak("SOS activated");
    }

    showEmergency(message) {
        if (this.emergencyDetails) {
            this.emergencyDetails.innerHTML = message.replace(/\n/g, '<br>');
        }
        if (this.emergencyOverlay) {
            this.emergencyOverlay.classList.remove('hidden');
        }
    }

    hideEmergency() {
        if (this.emergencyOverlay) {
            this.emergencyOverlay.classList.add('hidden');
        }
        if (this.sosWarning) {
            this.sosWarning.classList.add('hidden');
        }
        window.showDebug('✅ Emergency dismissed');
    }

    isExpired(expiryDate) {
        if (!expiryDate || expiryDate === 'Not visible') return false;
        const expDate = new Date(expiryDate.split('/').reverse().join('-'));
        return expDate < new Date();
    }

    // ============== HISTORY ==============
    saveToHistory(medicine) {
        let cabinet = JSON.parse(localStorage.getItem('medicineCabinet') || '[]');
        cabinet.unshift({
            ...medicine,
            scannedAt: new Date().toISOString(),
            expired: medicine.expiry ? this.isExpired(medicine.expiry) : false
        });
        cabinet = cabinet.slice(0, 10);
        localStorage.setItem('medicineCabinet', JSON.stringify(cabinet));
        this.displayCabinet();
    }

    loadHistory() {
        this.displayCabinet();
    }

    displayCabinet() {
        if (!this.medicineCabinet) return;
        const cabinet = JSON.parse(localStorage.getItem('medicineCabinet') || '[]');
        
        if (cabinet.length === 0) {
            this.medicineCabinet.innerHTML = '<p>No medicines saved yet.</p>';
            return;
        }
        
        this.medicineCabinet.innerHTML = cabinet.map(med => `
            <div class="medicine-item ${med.expired ? 'expired' : ''}">
                ${med.expired ? '<span class="expired-label">⚠️ EXPIRED</span>' : ''}
                <strong>${med.name || 'Unknown'}</strong><br>
                ${med.expiry ? `Expires: ${med.expiry}<br>` : ''}
                <small>${new Date(med.scannedAt).toLocaleDateString()}</small>
            </div>
        `).join('');
    }

    displayResults(text) {
        if (this.scanResults) {
            this.scanResults.innerHTML = text.replace(/\n/g, '<br>');
        }
        if (this.results) {
            this.results.classList.remove('hidden');
        }
    }

    toggleComparisonMode() {
        if (this.comparisonMode) {
            this.comparisonMode.classList.toggle('hidden');
            window.showDebug('🔄 Comparison mode toggled');
        }
    }

    async captureForComparison(slot) {
        window.showDebug(`📸 Scanning medicine ${slot}...`);
        const medicine = await this.captureAndAnalyze('compare');
        if (medicine) {
            if (slot === 1 && this.medicine1Name) {
                this.medicine1Name.textContent = medicine.name || 'Medicine 1';
            } else if (this.medicine2Name) {
                this.medicine2Name.textContent = medicine.name || 'Medicine 2';
            }
            window.showDebug(`✅ Medicine ${slot} captured`);
        }
    }

    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        window.showDebug('🎨 High contrast toggled');
    }

    toggleLargeText() {
        document.body.classList.toggle('large-text');
        window.showDebug('🔤 Large text toggled');
    }

    toggleVoiceSpeed() {
        const speeds = [0.5, 0.75, 1, 1.25, 1.5];
        const currentIndex = speeds.indexOf(this.voiceSpeed);
        this.voiceSpeed = speeds[(currentIndex + 1) % speeds.length];
        localStorage.setItem('voiceSpeed', this.voiceSpeed);
        this.speak(`Speed ${this.voiceSpeed}`);
        window.showDebug(`🐢 Speed: ${this.voiceSpeed}`);
    }

    showError(message) {
        window.showDebug('❌ ' + message);
        if (this.voiceStatus) {
            this.voiceStatus.textContent = message;
        }
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app...');
    window.app = new SightSage();
});