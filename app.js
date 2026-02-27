// SightSage - COMPLETE VERSION with camera fixes
// Add this as the FIRST LINE
const isVercel = typeof process !== 'undefined' && process.env && process.env.GROQ_API_KEY;
console.log('🚀 SightSage starting...');

class SightSage {
    constructor() {
        console.log('Constructor running');
        
        // API Configuration
        this.API_KEY = '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';
        this.API_URL = 'https://api.groq.com/openai/v1/chat/completions';
        this.VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
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
        this.currentStream = null;
        
        // Get all elements
        this.getAllElements();
        
        // Initialize everything
        this.setupEventListeners();
        this.initializeVoiceCommands();
        this.loadHistory();
        this.setupAccessibility();
        
        this.updateStatus('📱 Ready - Tap "Scan Medicine" to start');
        console.log('✅ App fully initialized');
    }
    
    getAllElements() {
        this.camera = document.getElementById('camera');
        this.canvas = document.getElementById('captureCanvas');
        this.results = document.getElementById('results');
        this.scanResults = document.getElementById('scanResults');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.medicineCabinet = document.getElementById('medicineCabinet');
        
        this.scanBtn = document.getElementById('scanButton');
        this.compareBtn = document.getElementById('compareButton');
        this.sosBtn = document.getElementById('sosButton');
        this.voiceBtn = document.getElementById('voiceButton');
        this.textInputBtn = document.getElementById('textInputButton');
        this.readAloudBtn = document.getElementById('readAloudButton');
        
        this.highContrastToggle = document.getElementById('highContrastToggle');
        this.textSizeToggle = document.getElementById('textSizeToggle');
        this.voiceSpeedToggle = document.getElementById('voiceSpeedToggle');
        
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
        
        console.log('Elements loaded');
    }
    
    setupEventListeners() {
        if (this.scanBtn) {
            this.scanBtn.onclick = () => {
                console.log('📸 Scan clicked');
                this.startCameraAndScan();
            };
        }
        
        if (this.compareBtn) {
            this.compareBtn.onclick = () => {
                console.log('🔄 Compare clicked');
                this.toggleComparisonMode();
            };
        }
        
        if (this.sosBtn) {
            this.sosBtn.onclick = () => {
                console.log('🆘 SOS clicked');
                this.handleSOS();
            };
        }
        
        if (this.voiceBtn) {
            this.voiceBtn.onclick = () => {
                console.log('🎤 Voice clicked');
                this.startVoiceRecognition();
            };
        }
        
        if (this.textInputBtn) {
            this.textInputBtn.onclick = () => {
                console.log('⌨️ Text clicked');
                this.toggleTextInput();
            };
        }
        
        if (this.submitText) {
            this.submitText.onclick = () => {
                this.processTextQuestion();
            };
        }
        
        if (this.readAloudBtn) {
            this.readAloudBtn.onclick = () => {
                if (this.scanResults && this.scanResults.textContent) {
                    this.speak(this.scanResults.textContent);
                }
            };
        }
        
        if (this.textQuestion) {
            this.textQuestion.onkeypress = (e) => {
                if (e.key === 'Enter') this.processTextQuestion();
            };
        }
        
        if (this.captureForCompare1) {
            this.captureForCompare1.onclick = () => this.captureForComparison(1);
        }
        if (this.captureForCompare2) {
            this.captureForCompare2.onclick = () => this.captureForComparison(2);
        }
        if (this.performComparison) {
            this.performComparison.onclick = () => this.compareMedicines();
        }
        
        if (this.dismissEmergency) {
            this.dismissEmergency.onclick = () => this.hideEmergency();
        }
        
        document.addEventListener('click', () => this.detectTripleTap());
    }
    
    setupAccessibility() {
        if (this.highContrastToggle) {
            this.highContrastToggle.onclick = () => {
                document.body.classList.toggle('high-contrast');
                localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
            };
        }
        
        if (this.textSizeToggle) {
            this.textSizeToggle.onclick = () => {
                document.body.classList.toggle('large-text');
                localStorage.setItem('largeText', document.body.classList.contains('large-text'));
            };
        }
        
        if (this.voiceSpeedToggle) {
            this.voiceSpeedToggle.onclick = () => {
                const speeds = [0.5, 0.75, 1, 1.25, 1.5];
                const currentIndex = speeds.indexOf(this.voiceSpeed);
                this.voiceSpeed = speeds[(currentIndex + 1) % speeds.length];
                localStorage.setItem('voiceSpeed', this.voiceSpeed);
                this.speak(`Speed ${this.voiceSpeed}`);
            };
        }
    }
    
    // ============== CAMERA FUNCTIONS ==============

    async startCameraAndScan() {
        this.updateStatus('📷 Requesting camera...');
        
        try {
            // Stop any existing stream first
            this.stopCamera();
            
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (constraintErr) {
                console.warn('Falling back to basic video constraints:', constraintErr);
                // Fallback: try with just video: true
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
            }

            this.currentStream = stream;

            // FIX: always make video element visible before assigning srcObject
            this.camera.style.display = 'block';
            this.camera.srcObject = stream;

            // FIX: wait for the video to be ready with actual dimensions
            await this.waitForVideoReady(this.camera);

            this.updateStatus('✅ Camera ready! Analyzing...');
            await this.captureAndAnalyze();

        } catch (err) {
            console.error('Camera error:', err);
            this.handleCameraError(err);
        }
    }

    /**
     * FIX: Waits until the video element has nonzero dimensions and is actually playing.
     * This prevents capturing a blank frame.
     */
    waitForVideoReady(videoEl, timeoutMs = 8000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();

            const check = () => {
                if (videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
                    resolve();
                    return;
                }
                if (Date.now() - start > timeoutMs) {
                    reject(new Error('Camera timed out – no video dimensions after ' + timeoutMs + 'ms'));
                    return;
                }
                requestAnimationFrame(check);
            };

            // Kick off play() and start polling
            videoEl.play()
                .then(() => check())
                .catch(err => {
                    // play() can fail on some browsers if autoplay is blocked;
                    // still try polling in case it starts on its own
                    console.warn('video.play() rejected:', err);
                    check();
                });
        });
    }
    
    async captureAndAnalyze() {
        this.updateStatus('📸 Capturing image...');
        
        if (!this.camera || !this.canvas) {
            this.updateStatus('❌ Camera or canvas element missing');
            return;
        }

        // FIX: double-check dimensions before drawing
        if (this.camera.videoWidth === 0 || this.camera.videoHeight === 0) {
            this.updateStatus('❌ Camera frame has no dimensions yet');
            this.stopCamera();
            return;
        }
        
        this.canvas.width = this.camera.videoWidth;
        this.canvas.height = this.camera.videoHeight;
        
        const ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.camera, 0, 0);
        
        // FIX: use a higher quality value and validate image data is not blank
        const imageData = this.canvas.toDataURL('image/jpeg', 0.85);

        if (!imageData || imageData === 'data:,') {
            this.updateStatus('❌ Failed to capture image data');
            this.stopCamera();
            return;
        }

        this.updateStatus('🤖 Analyzing with AI...');
        
        const analysis = await this.analyzeWithGroq(imageData);
        this.displayResults(analysis);
        
        // Stop camera after successful capture
        this.stopCamera();
    }
    
    async analyzeWithGroq(imageData) {
        const base64Image = imageData.split(',')[1];
        
        const prompt = `You are SightSage, a caring and patient medicine assistant for elderly and visually impaired users. Look at this medicine image and provide information in a warm, conversational, clear way.

Please cover these points naturally (not as a numbered list):

• The medicine name
• Expiry date (or ask to show it if not visible)
• What it looks like (color, shape)
• What it's used for
• How to take it (with/without food)
• Common side effects
• Special advice for elderly people
• If someone has heart problems, what to know
• Things to avoid (foods, drinks, other medicines)
• One friendly tip for safe use

Write like you're gently explaining to an older family member - warm, clear, and reassuring. Use short sentences. Keep it complete but easy to follow.

Important: Please write naturally like you're speaking to someone, not as a list with numbers. Use simple words, short sentences, and a warm tone. Avoid medical jargon unless you explain it. If you're not sure about something, be honest about it.`;
        
        try {
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
                    temperature: 0.4, // Slightly higher for more natural language
                    max_tokens: 800
                })
            });
            
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API error ${response.status}: ${errorBody}`);
            }
            
            const data = await response.json();
            const analysis = data.choices[0].message.content;
            
            // Still parse for expiry detection even with natural language
            const medicineInfo = this.parseMedicineInfo(analysis);
            this.medicines.current = medicineInfo;
            this.saveToHistory(medicineInfo);
            
            if (medicineInfo.expiry && this.isExpired(medicineInfo.expiry)) {
                this.showEmergency('⚠️ EXPIRED MEDICINE - DO NOT TAKE');
            }
            
            return analysis;
            
        } catch (error) {
            console.error('API error:', error);
            return `I'm sorry, I had trouble analyzing the medicine. ${error.message}`;
        }
    }

    
    parseMedicineInfo(analysis) {
        // More flexible extraction that works with natural language
        return {
            name: this.extractFieldFlexible(analysis, ['name', 'called']) || 'Unknown',
            expiry: this.extractExpiryDate(analysis) || null,
            ingredients: '', // We don't need to extract these separately anymore
            warnings: '',
            description: ''
        };
    }
    
    extractFieldFlexible(text, keywords) {
        if (!text) return null;
        const lowerText = text.toLowerCase();
        for (const keyword of keywords) {
            const patterns = [
                new RegExp(`${keyword}[\\s\\:]+([^\\.]+)`, 'i'),
                new RegExp(`${keyword}[\\s\\:]+([^\\n]+)`, 'i'),
                new RegExp(`(?:is|called)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'i')
            ];
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) return match[1].trim();
            }
        }
        return null;
    }
    
    extractExpiryDate(text) {
        if (!text) return null;
        // Look for dates in various formats
        const patterns = [
            /expir(?:y|es?)(?:\s+on)?\s*[:\-]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
            /expiration\s+date[:\-]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
            /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
            /(?:valid|good)\s+(?:until|till)\s+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                // Standardize to DD/MM/YYYY format
                let date = match[1];
                // Convert various separators to /
                date = date.replace(/[.-]/g, '/');
                return date;
            }
        }
        return null;
    }

    stopCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
        if (this.camera) {
            this.camera.srcObject = null;
            // FIX: hide with display none so next scan can re-show cleanly
            this.camera.style.display = 'none';
        }
    }
    
    // ============== COMPARISON FUNCTIONS ==============

    toggleComparisonMode() {
        if (this.comparisonMode) {
            this.comparisonMode.classList.toggle('hidden');
            this.medicines.compare1 = null;
            this.medicines.compare2 = null;
            if (this.medicine1Name) this.medicine1Name.textContent = 'Medicine 1';
            if (this.medicine2Name) this.medicine2Name.textContent = 'Medicine 2';
            if (this.comparisonResults) {
                this.comparisonResults.innerHTML = '';
                this.comparisonResults.classList.add('hidden');
            }
        }
    }
    
    async captureForComparison(slot) {
        this.updateStatus(`📸 Scanning medicine ${slot}...`);
        
        try {
            // Stop any existing stream
            this.stopCamera();

            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' } }
                });
            } catch {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
            }

            this.currentStream = stream;
            this.camera.style.display = 'block';
            this.camera.srcObject = stream;

            await this.waitForVideoReady(this.camera);

            this.canvas.width = this.camera.videoWidth;
            this.canvas.height = this.camera.videoHeight;
            const ctx = this.canvas.getContext('2d');
            ctx.drawImage(this.camera, 0, 0);
            const imageData = this.canvas.toDataURL('image/jpeg', 0.85);

            this.stopCamera();

            this.updateStatus(`✅ Medicine ${slot} captured`);

            // Analyze the captured image
            const analysis = await this.analyzeWithGroq(imageData);
            const medicine = this.parseMedicineInfo(analysis);

            if (slot === 1) {
                this.medicines.compare1 = medicine;
                if (this.medicine1Name) this.medicine1Name.textContent = medicine.name || 'Medicine 1 (captured)';
            } else {
                this.medicines.compare2 = medicine;
                if (this.medicine2Name) this.medicine2Name.textContent = medicine.name || 'Medicine 2 (captured)';
            }

        } catch (err) {
            this.handleCameraError(err);
        }
    }
    
    async compareMedicines() {
        if (!this.medicines.compare1 || !this.medicines.compare2) {
            this.speak("Please scan two medicines first");
            return;
        }
        
        this.updateStatus('🔄 Comparing medicines...');
        
        const prompt = `Compare these two medicines:
Medicine 1: ${JSON.stringify(this.medicines.compare1)}
Medicine 2: ${JSON.stringify(this.medicines.compare2)}

Provide:
1. Shared ingredients
2. Interaction warning (Critical/Caution/Safe)
3. Simple advice
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
                this.showEmergency('⚠️ CRITICAL INTERACTION DETECTED');
            }
            
            this.speak("Comparison complete");
            
        } catch (error) {
            if (this.comparisonResults) {
                this.comparisonResults.innerHTML = "Error comparing medicines";
            }
        }
    }
    
    // ============== VOICE FUNCTIONS ==============

    initializeVoiceCommands() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.log('Voice not supported');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        
        this.recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
            this.updateStatus(`Heard: "${command}"`);
            
            if (command.includes('scan')) {
                this.startCameraAndScan();
            } else if (command.includes('compare')) {
                this.toggleComparisonMode();
            } else if (command.includes('emergency') || command.includes('help')) {
                this.handleSOS();
            }
        };
        
        this.recognition.onerror = () => {
            this.updateStatus("Voice recognition error");
            this.isListening = false;
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
        };
    }
    
    startVoiceRecognition() {
        if (!this.recognition) {
            this.updateStatus("Voice not available");
            return;
        }
        
        try {
            if (this.isListening) {
                this.recognition.stop();
                this.isListening = false;
                return;
            }
            
            this.recognition.start();
            this.isListening = true;
            this.updateStatus("🎤 Listening... Say a command");
            
            setTimeout(() => {
                if (this.isListening) {
                    this.recognition.stop();
                    this.isListening = false;
                    this.updateStatus("Voice ready");
                }
            }, 10000);
        } catch (e) {
            this.updateStatus("Voice error");
        }
    }
    
    speak(text) {
        if (!text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.voiceSpeed;
        window.speechSynthesis.speak(utterance);
    }
    
    // ============== TEXT INPUT ==============

    toggleTextInput() {
        if (this.textInputArea) {
            this.textInputArea.classList.toggle('hidden');
            if (!this.textInputArea.classList.contains('hidden') && this.textQuestion) {
                this.textQuestion.focus();
            }
        }
    }
    
    async processTextQuestion() {
        if (!this.textQuestion) return;
        
        const question = this.textQuestion.value;
        if (!question) return;
        
        this.updateStatus("Processing question...");
        
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
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.3,
                    max_tokens: 1024
                })
            });
            
            const data = await response.json();
            const answer = data.choices[0].message.content;
            
            this.displayResults(answer);
            this.speak(answer);
            this.textQuestion.value = '';
            if (this.textInputArea) {
                this.textInputArea.classList.add('hidden');
            }
            
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
        if (this.sosWarning) {
            this.sosWarning.classList.remove('hidden');
        }
        
        let emergencyText = "🚨 EMERGENCY - Current Medicines:\n";
        
        if (this.medicines.current) {
            emergencyText += `Current: ${this.medicines.current.name}\n`;
        }
        
        const cabinet = JSON.parse(localStorage.getItem('medicineCabinet') || '[]');
        cabinet.forEach(med => {
            emergencyText += `${med.name} (${med.expiry || 'No expiry'})\n`;
        });
        
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
    }
    
    // ============== HISTORY FUNCTIONS ==============

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
            this.medicineCabinet.innerHTML = '<p>No medicines saved yet</p>';
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
    
    // ============== UTILITY FUNCTIONS ==============

    isExpired(expiryDate) {
        if (!expiryDate || expiryDate === 'Not visible') return false;
        // FIX: safely parse DD/MM/YYYY
        const parts = expiryDate.split('/');
        if (parts.length !== 3) return false;
        const [day, month, year] = parts;
        const expDate = new Date(`${year}-${month}-${day}`);
        return !isNaN(expDate.getTime()) && expDate < new Date();
    }
    
    displayResults(text) {
        if (this.scanResults) {
            this.scanResults.innerHTML = text.replace(/\n/g, '<br>');
        }
        if (this.results) {
            this.results.classList.remove('hidden');
        }
        this.updateStatus('✅ Analysis complete');
    }
    
    handleCameraError(err) {
        console.error('Camera error details:', err.name, err.message);
        this.stopCamera();

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            this.updateStatus('❌ Camera permission denied');
            alert('Camera access was denied.\n\nTo fix:\n1. Tap the 🔒 icon in your browser address bar\n2. Set Camera to "Allow"\n3. Refresh the page and try again');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            this.updateStatus('❌ No camera found');
            alert('No camera found on this device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            this.updateStatus('❌ Camera in use by another app');
            alert('Camera is being used by another app. Close it and try again.');
        } else if (err.name === 'OverconstrainedError') {
            this.updateStatus('❌ Camera constraint error – retrying…');
            // Retry with no constraints
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    this.currentStream = stream;
                    this.camera.style.display = 'block';
                    this.camera.srcObject = stream;
                    return this.waitForVideoReady(this.camera);
                })
                .then(() => this.captureAndAnalyze())
                .catch(e => {
                    this.updateStatus('❌ Camera failed: ' + e.message);
                    alert('Camera error: ' + e.message);
                });
        } else {
            this.updateStatus('❌ Camera error: ' + err.message);
            alert('Camera error: ' + err.message);
        }
    }
    
    updateStatus(msg) {
        console.log('Status:', msg);
        if (this.voiceStatus) {
            this.voiceStatus.innerHTML = msg;
        }
    }
}

// Initialize app
window.onload = () => {
    console.log('📱 Page loaded');
    window.app = new SightSage();
};