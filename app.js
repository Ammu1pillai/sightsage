// SightSage - COMPLETE VERSION with camera fixes
// Add this as the FIRST LINE


const isVercel = typeof process !== 'undefined' && process.env && process.env.GROQ_API_KEY;
console.log('🚀 SightSage starting...');

class SightSage {
    constructor() {
        console.log('Constructor running');
        
        // API Configuration
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
        this.uploadBtn = document.getElementById('uploadButton');
        this.fileInput = document.getElementById('fileInput');
        
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

        console.log('🔍 Checking upload elements...');
        console.log('🔍 uploadBtn:', this.uploadBtn);
        console.log('🔍 fileInput:', this.fileInput);

        if (this.uploadBtn) {
            console.log('✅ Upload button found - attaching click handler');
            this.uploadBtn.onclick = () => {
                console.log('📁 Upload button CLICKED!');
                console.log('📁 About to click file input:', this.fileInput);
                if (this.fileInput) {
                    this.fileInput.click();
                    console.log('📁 Click triggered on file input');
                } else {
                    console.error('❌ fileInput is null!');
                }
            };
        } else {
            console.error('❌ uploadBtn is null! Check if element with id "uploadButton" exists');
        }

        if (this.fileInput) {
            console.log('✅ File input found - attaching change handler');
            this.fileInput.onchange = (e) => {
                console.log('📁 File input change event triggered!');
                console.log('📁 Event:', e);
                console.log('📁 Files:', e.target.files);
                const file = e.target.files[0];
                if (file) {
                    console.log('📁 File selected:', file.name, 'type:', file.type, 'size:', file.size);
                    this.processUploadedFile(file);
                } else {
                    console.log('📁 No file selected');
                }
                this.fileInput.value = '';
            };
        } else {
            console.error('❌ fileInput is null! Check if element with id "fileInput" exists');
        }

        if (this.scanBtn) {
            this.scanBtn.onclick = () => {
                console.log('📸 Scan clicked');
                this.startCameraAndScan();
            };
        }

         if (this.uploadBtn) {
            this.uploadBtn.onclick = () => {
                console.log('📁 Upload clicked');
                this.fileInput.click();
            };
        }
    
        if (this.fileInput) {
            this.fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.processUploadedFile(file);
                }
                // Reset file input so same file can be selected again
                this.fileInput.value = '';
            };
        }

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
                console.log('🎤 Voice clicked'); // THIS LINE ALREADY EXISTS
                // ADD THESE DEBUG LINES BELOW IT:
                console.log('🎤 Voice button element:', this.voiceBtn);
                console.log('🎤 Recognition object exists:', !!this.recognition);
                console.log('🎤 Current isListening state:', this.isListening);
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
        
        const prompt = `You are SightSage, a medicine safety assistant. Look at this medicine image and respond with ONLY the following format.

IMPORTANT: Use your medical knowledge! Even if the image is unclear, you can provide GENERAL information about this type of medicine based on the name.

For example:
- If you see "Betahistine", you KNOW it's used for vertigo, Meniere's disease
- If you see "Paracetamol", you KNOW it's for pain and fever
- If you see "Amoxicillin", you KNOW it's an antibiotic for infections
- If you see "Omeprazole", you KNOW it's for acid reflux

Be helpful! Don't just say "Information not available" when you know the common uses.

Format:
🚨 DO NOT TAKE THIS MEDICINE - IT EXPIRED ON [DATE] 🚨
(ONLY include this line if the medicine is expired. If not expired or expiry not visible, DO NOT include this line)

MEDICINE NAME: [exact name from packaging]
EXPIRY DATE: [exact date if visible, or "Not visible"]
APPEARANCE: [color, shape, markings, or what you can see]
USES: [what it's commonly used for - use your knowledge!]
HOW TO TAKE: [typical instructions for this medicine]
COMMON SIDE EFFECTS: [common side effects for this medicine]
ELDERLY ADVICE: [general advice for elderly taking this type of medicine]
HEART PATIENTS: [what heart patients should know about this medicine]
AVOID: [common interactions or things to avoid]
SAFETY TIP: [one practical tip for this medicine]

RULES:
1. Use EXACTLY this format
2. No text before or after
3. If you recognize the medicine name, PROVIDE USEFUL INFORMATION about its typical uses, side effects, etc.
4. Only use "Information not available" if you truly don't know the medicine
5. Be helpful - users need real information, be warm!`;
        
        try {
            const response = await fetch('/api/analyze',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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

            console.log('🔍 Expiry date extracted:', medicineInfo.expiry);
            console.log('🔍 Is expired?', medicineInfo.expiry ? this.isExpired(medicineInfo.expiry) : 'no expiry');
            
            if (medicineInfo.expiry && this.isExpired(medicineInfo.expiry)) {
                this.showEmergency('⚠️ EXPIRED MEDICINE - DO NOT TAKE');
            }
            
            return analysis;
            
        } catch (error) {
            console.error('API error:', error);
            return `I'm sorry, I had trouble analyzing the medicine. ${error.message}`;
        }
    }

    processUploadedFile(file) {
        this.updateStatus('📁 Processing uploaded image...');
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageData = e.target.result;
            this.updateStatus('🤖 Analyzing uploaded image...');
            const analysis = await this.analyzeWithGroq(imageData);
            this.displayResults(analysis);
        };
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            this.updateStatus('❌ Error reading file');
        };
        reader.readAsDataURL(file);
    }

    
    parseMedicineInfo(analysis) {
        if (!analysis) return {
            name: 'Unknown',
            description: 'Medicine information'
        };
        
        const name = this.extractMedicineName(analysis);
        const description = this.extractMedicineUse(analysis);
        const expiry = this.extractExpiryDate(analysis);
        
        return {
            name: name || 'Unknown',
            description: description || 'Medicine information',
            expiry: expiry || null  // ✅ Add comma after description line
        };
    }

    extractMedicineName(analysis) {
        if (!analysis) return null;
        
        // FIRST: Look for MEDICINE NAME: label (this is our primary method)
        const nameMatch = analysis.match(/MEDICINE NAME:\s*([^\n]+)/i);
        if (nameMatch && nameMatch[1]) {
            let name = nameMatch[1].trim();
            // Remove any trailing punctuation
            name = name.replace(/[.,;:]+$/, '').trim();
            if (name && name.length > 1 && name !== "Not visible" && name !== "Not clearly visible") {
                return name;
            }
        }
        
        // ONLY if we couldn't find a name with the label, check for unclear patterns
        const unclearPatterns = [
            "can't see", "cannot see", "trouble seeing", "unable to see",
            "not clear", "blurry", "can't tell", "cannot tell",
            "hard to see", "difficult to see", "can't make out", "cannot make out",
            "not visible", "can't read", "cannot read", "unreadable",
            "not legible", "having trouble", "can't provide", "don't have enough",
            "insufficient", "can't determine", "unable to determine"
        ];
        
        const lowerAnalysis = analysis.toLowerCase();
        for (const pattern of unclearPatterns) {
            if (lowerAnalysis.includes(pattern)) {
                return "[Image unclear - can't read medicine name]";
            }
        }
        
        return null;
    }

    extractMedicineUse(analysis) {
        if (!analysis) return null;
        
        // FIRST: Look for USES: label and capture everything until the next label
        // This regex captures from "USES:" until the next ALL CAPS label or end of string
        const usesMatch = analysis.match(/USES:\s*([\s\S]*?)(?=\n[A-Z ]+:|$)/i);
        if (usesMatch && usesMatch[1]) {
            let use = usesMatch[1].trim();
            
            // Remove common prefixes like "It's used for" or "it is used for"
            use = use.replace(/^(?:it['']?s|it is)\s+(?:used\s+)?(?:for|to\s+treat)?\s*/i, '');
            
            // Replace newlines with spaces
            use = use.replace(/\s+/g, ' ').trim();
            
            // Find the FIRST full stop and take everything up to it
            const fullStopIndex = use.indexOf('.');
            if (fullStopIndex !== -1) {
                use = use.substring(0, fullStopIndex + 1); // Include the full stop
            }
            
            // Clean up any trailing punctuation at the very end
            use = use.replace(/[.,;:]+$/, '').trim();
            
            if (use && use.length > 2 && use !== "Not visible" && use !== "Not clearly visible" && use !== "Information not available") {
                // Capitalize first letter
                use = use.charAt(0).toUpperCase() + use.slice(1);
                if (use.length > 150) {
                    use = use.substring(0, 147) + '...';
                }
                return use;
            }
        }
        
        // ONLY if we couldn't find a use with the label, check for unclear patterns
        const unclearPatterns = [
            "can't see", "cannot see", "trouble seeing", "unable to see",
            "not clear", "blurry", "can't tell", "cannot tell",
            "hard to see", "difficult to see", "can't make out", "cannot make out",
            "not visible", "can't read", "cannot read", "unreadable",
            "not legible", "having trouble", "can't provide", "don't have enough",
            "insufficient", "can't determine", "unable to determine"
        ];
        
        const lowerAnalysis = analysis.toLowerCase();
        for (const pattern of unclearPatterns) {
            if (lowerAnalysis.includes(pattern)) {
                return "[Image unclear - can't determine usage]";
            }
        }
        
        return null;
    }

    // Update saveToHistory to store the description
    saveToHistory(medicine) {
        let cabinet = JSON.parse(localStorage.getItem('medicineCabinet') || '[]');
        
        cabinet.unshift({
            name: medicine.name || 'Unknown',
            expiry: medicine.expiry || null,
            description: medicine.description || 'Medicine information', // Store the one-liner
            scannedAt: new Date().toISOString(),
            expired: medicine.expiry ? this.isExpired(medicine.expiry) : false
        });
        
        cabinet = cabinet.slice(0, 10);
        localStorage.setItem('medicineCabinet', JSON.stringify(cabinet));
        this.displayCabinet();
    }

    // Update displayCabinet to show name + description
    // Update displayCabinet to work with dropdown select
    // Update displayCabinet to work with dropdown select
    displayCabinet() {
        if (!this.medicineCabinet) return;
        
        const cabinet = JSON.parse(localStorage.getItem('medicineCabinet') || '[]');
        const cabinetDetails = document.getElementById('cabinetDetails');
        
        // Clear current options
        this.medicineCabinet.innerHTML = '<option value="">Select a medicine to view details</option>';
        
        if (cabinet.length === 0) {
            return;
        }
        
        // Add medicines to dropdown
        cabinet.forEach((med, index) => {
            const option = document.createElement('option');
            option.value = index;
            
            // Create display text with name and description
            let displayText = med.name || 'Unknown';
            if (med.description && med.description !== 'Medicine information') {
                // Clean up description - remove "Used for" prefix if present
                let cleanDesc = med.description.replace(/^used for\s+/i, '');
                displayText += ` - ${cleanDesc}`;
            }
            
            option.textContent = displayText;
            this.medicineCabinet.appendChild(option);
        });
        
        // Add change event listener to show details
        this.medicineCabinet.onchange = (e) => {
            const selectedIndex = e.target.value;
            if (selectedIndex === '') {
                if (cabinetDetails) cabinetDetails.classList.add('hidden');
                return;
            }
            
            const selectedMed = cabinet[selectedIndex];
            if (selectedMed && cabinetDetails) {
                cabinetDetails.innerHTML = `
                    <strong>${selectedMed.name || 'Unknown'}</strong><br>
                    ${selectedMed.description ? `<span class="medicine-desc">${selectedMed.description}</span><br>` : ''}
                    <small>Scanned: ${new Date(selectedMed.scannedAt).toLocaleDateString()}</small>
                    ${selectedMed.expiry ? `<br><small>Expires: ${selectedMed.expiry}</small>` : ''}
                `;
                cabinetDetails.classList.remove('hidden');
            }
        };
        
        // Update badge count
        const badge = document.getElementById('cabinetCount');
        if (badge) {
            badge.textContent = cabinet.length;
        }
    }
    
    loadHistory() {
        this.displayCabinet();
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
        
        // Look for EXPIRY DATE: field
        const expiryMatch = text.match(/EXPIRY DATE:\s*([^\n]+)/i);
        if (!expiryMatch) return null;
        
        let dateStr = expiryMatch[1].trim();
        
        // Remove any non-date text
        dateStr = dateStr.replace(/[^0-9\/]/g, '').trim();
        if (!dateStr) return null;
        
        return dateStr; // Return as MM/YYYY or DD/MM/YYYY format
    }

    // Update isExpired to handle both formats
    isExpired(expiryDate) {
        if (!expiryDate || expiryDate === 'Not visible') return false;
        
        let day, month, year;
        const parts = expiryDate.split('/');
        
        if (parts.length === 2) {
            // Format: MM/YYYY
            month = parseInt(parts[0]);
            year = parseInt(parts[1]);
            day = new Date(year, month, 0).getDate();
        } else if (parts.length === 3) {
            // Format: DD/MM/YYYY
            day = parseInt(parts[0]);
            month = parseInt(parts[1]);
            year = parseInt(parts[2]);
        } else {
            return false;
        }
        
        const expDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expDate.setHours(0, 0, 0, 0);
        
        return expDate < today;
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
        
        const prompt = `Compare these two medicines and tell me about taking them together:

    Medicine 1: ${JSON.stringify(this.medicines.compare1)}
    Medicine 2: ${JSON.stringify(this.medicines.compare2)}

    Give a response in this simple list format:

    • CAN THEY BE TAKEN TOGETHER? [YES / NO / WITH CAUTION]

    • WHY? [1-2 sentences explaining the reason]

    • WHAT HAPPENS? [1-2 sentences describing the effect]

    • RISK LEVEL: [HIGH / MEDIUM / LOW]

    • ADVICE: [One clear sentence what to do]

    Keep it simple and clear. No extra text, just these 5 bullet points.`;
        
        try {
            const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
                body: JSON.stringify({
                    model: this.TEXT_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.3,
                    max_tokens: 250
                })
            });
            
            const data = await response.json();
            const comparison = data.choices[0].message.content;
            
            if (this.comparisonResults) {

                this.comparisonResults.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--card-border);">
                        <span style="font-weight: bold; color: var(--teal-light); font-size: 1rem;">📊 Comparison Result</span>
                        <button id="readComparisonBtn" class="speak-btn" style="padding: 5px 12px; font-size: 0.85rem; background: rgba(20,184,166,0.1); color: var(--teal-light); border: 1px solid var(--teal); border-radius: var(--r-pill); cursor: pointer;">
                            🔊 Read Aloud
                        </button>
                    </div>
                    <div id="comparisonText">${comparison.replace(/\n/g, '<br>')}</div>
                `;
                
                // Add event listener to the read aloud button
                const readComparisonBtn = document.getElementById('readComparisonBtn');
                if (readComparisonBtn) {
                    readComparisonBtn.onclick = () => {
                        // Get the text content without HTML tags
                        const comparisonText = document.getElementById('comparisonText').innerText || 
                                            document.getElementById('comparisonText').textContent;
                        this.speak(comparisonText);
                    };
                }
                
                this.comparisonResults.classList.remove('hidden');
            }
            
            // Check for high risk
            if (comparison.toLowerCase().includes('risk level: high')) {
                this.showEmergency('⚠️ HIGH RISK COMBINATION - READ CAREFULLY');
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
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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
        
        const now = new Date();
        const timestamp = now.toLocaleString();
        
        // Get valid medicines only (filter out junk)
        const cabinet = JSON.parse(localStorage.getItem('medicineCabinet') || '[]');
        const validMeds = cabinet.filter(med => 
            med.name && 
            med.name !== 'Unknown' && 
            med.name.length < 50 && // Filter out long error messages
            !med.name.includes('image') && 
            !med.name.includes('see any')
        );
        
        let emergencyText = "🚨 EMERGENCY REPORT\n";
        emergencyText += `🕐 ${timestamp}\n\n`;
        emergencyText += "💊 MEDICINES BEING TAKEN:\n";
        
        if (validMeds.length === 0) {
            emergencyText += "• No medicines recorded\n";
        } else {
            // Show only the 5 most recent valid medicines
            validMeds.slice(0, 5).forEach((med, i) => {
                emergencyText += `${i+1}. ${med.name}`;
                if (med.expiry) {
                    const expired = this.isExpired(med.expiry) ? " ⚠️ EXPIRED" : "";
                    emergencyText += ` (Exp: ${med.expiry}${expired})`;
                }
                emergencyText += `\n`;
            });
        }
        
        emergencyText += `\n📞 ACTION REQUIRED:\n`;
        emergencyText += `• If serious: Call 108 (India) or 911 (US)\n`;
        emergencyText += `• Show this list to the doctor\n`;
        emergencyText += `• Bring the actual medicine packets\n`;
        
        this.showEmergency(emergencyText);
        this.speak("SOS activated. Showing medicine list.");
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

    
    
    // ============== UTILITY FUNCTIONS ==============

    
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