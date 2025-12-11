// Optimized VERTA Website JavaScript

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.className = 'fas fa-bars';
            } else {
                icon.className = 'fas fa-times';
            }
        });
    }
});

// Smooth Scrolling for Navigation Links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    const icon = document.querySelector('#mobile-menu-btn i');
                    if (icon) {
                        icon.className = 'fas fa-bars';
                    }
                }
            }
        });
    });
});

// Scroll to Demo Function
function scrollToDemo() {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
        const offsetTop = demoSection.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// File Upload Functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const analyzeBtn = document.getElementById('analyze-btn');
    const progressSection = document.getElementById('progress-section');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    let selectedFile = null;
    
    // Upload zone click handler
    if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', function() {
            fileInput.click();
        });
        
        // Drag and drop handlers
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadZone.classList.add('border-purple-500', 'bg-purple-100');
        });
        
        uploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadZone.classList.remove('border-purple-500', 'bg-purple-100');
        });
        
        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadZone.classList.remove('border-purple-500', 'bg-purple-100');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
        
        // File input change handler
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }
    
    // Handle file selection
    function handleFileSelect(file) {
        selectedFile = file;
        
        // Validate file type
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['mp3', 'wav', 'mp4', 'mov', 'avi', 'webm'];
        
        if (!allowedExtensions.includes(fileExtension)) {
            showNotification('Please select a valid audio or video file', 'error');
            return;
        }
        
        // Check file size (100MB limit)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            showNotification('File too large. Please select a file under 100MB', 'error');
            return;
        }
        
        // Display file info
        if (fileName && fileSize && fileInfo && analyzeBtn) {
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            fileInfo.classList.remove('hidden');
            analyzeBtn.classList.remove('hidden');
        }
        
        showNotification('File selected successfully!', 'success');
    }
    
    // Analyze button click handler
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
            if (selectedFile) {
                startAnalysis();
            }
        });
    }
    
    // Start analysis
    function startAnalysis() {
        if (analyzeBtn && progressSection) {
            analyzeBtn.classList.add('hidden');
            progressSection.classList.remove('hidden');
            
            // Try real analysis first, fallback to demo
            analyzeWithVERTA(selectedFile);
        }
    }
    
    // Analyze with VERTA backend
    async function analyzeWithVERTA(file) {
        try {
            updateProgress(5, 'Initializing VERTA AI...');
            
            // Check backend health first
            const apiBase = window.location.hostname === 'localhost' ? 
                'http://localhost:5000' : 
                'https://verta-ai.onrender.com';
            
            console.log('Connecting to backend:', apiBase);
            
            const healthResponse = await fetch(`${apiBase}/health`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Health response status:', healthResponse.status);
            
            if (!healthResponse.ok) {
                throw new Error(`Backend not available: ${healthResponse.status} ${healthResponse.statusText}`);
            }
            
            const healthData = await healthResponse.json();
            console.log('Backend health:', healthData);
            
            updateProgress(15, 'Backend connected successfully...');
            
            // Upload file
            updateProgress(25, 'Uploading file to VERTA...');
            const formData = new FormData();
            formData.append('file', file);
            
            console.log('Sending file to analyze endpoint:', `${apiBase}/analyze`);
            
            const uploadResponse = await fetch(`${apiBase}/analyze`, {
                method: 'POST',
                mode: 'cors',
                body: formData
            });
            
            console.log('Analyze response status:', uploadResponse.status);
            
            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.error || 'Upload failed');
            }
            
            const uploadResult = await uploadResponse.json();
            console.log('Upload result:', uploadResult);
            
            updateProgress(45, 'File uploaded successfully...');
            
            // The analyze endpoint returns the analysis directly
            updateProgress(55, 'Processing AI analysis...');
            
            const analysisResult = await uploadResponse.json();
            console.log('Analysis result:', analysisResult);
            
            if (!analysisResult) {
                throw new Error('Analysis failed - no result returned');
            }
            
            updateProgress(85, 'AI analysis complete...');
            updateProgress(95, 'Processing results...');
            
            // Simulate final processing for better UX
            setTimeout(() => {
                updateProgress(100, 'Analysis complete!');
                setTimeout(() => {
                    displayRealResults(analysisResult);
                }, 800);
            }, 1000);
            
        } catch (error) {
            console.error('VERTA Analysis error:', error);
            
            if (progressSection) {
                progressSection.classList.add('hidden');
            }
            
            // Reset analyze button
            if (analyzeBtn) {
                analyzeBtn.classList.remove('hidden');
            }
            
            // Show specific error handling
            if (error.message.includes('Backend not available') || error.message.includes('fetch')) {
                showBackendUnavailable();
            } else if (error.message.includes('File too large')) {
                showNotification('File too large. Please use a file under 100MB.', 'error');
            } else if (error.message.includes('File type not supported')) {
                showNotification('File type not supported. Please use MP3, WAV, MP4, MOV, AVI, or WebM.', 'error');
            } else if (error.message.includes('Method not allowed') || error.message.includes('405')) {
                showNotification('Backend configuration error. Please check server logs.', 'error');
            } else {
                showNotification(`Analysis failed: ${error.message}`, 'error');
                console.log('Falling back to demo results...');
                setTimeout(() => {
                    generateDemoResults();
                }, 2000);
            }
        }
    }
    
    // Update progress
    function updateProgress(percent, message) {
        if (progressBar && progressText) {
            progressBar.style.width = percent + '%';
            progressText.textContent = Math.round(percent) + '%';
        }
    }
    
    // Show backend unavailable message
    function showBackendUnavailable() {
        const demoResults = document.getElementById('demo-results');
        if (demoResults) {
            demoResults.innerHTML = `
                <div class="demo-card text-center py-8">
                    <div class="text-4xl mb-3">🔌</div>
                    <h2 class="text-xl font-bold text-red-600 mb-3">VERTA Backend Offline</h2>
                    <p class="text-gray-600 mb-4 text-sm">
                        The VERTA backend API is not running. Start it to get real AI analysis:
                    </p>
                    
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <h3 class="font-semibold text-red-800 mb-2 text-sm">🚀 Start VERTA Backend</h3>
                        <div class="text-xs text-red-700 text-left space-y-2">
                            <div>
                                <p><strong>1. Set API Key:</strong></p>
                                <code class="block bg-red-100 p-2 rounded text-xs">export GEMINI_API_KEY="your-api-key"</code>
                            </div>
                            <div>
                                <p><strong>2. Start Backend:</strong></p>
                                <code class="block bg-red-100 p-2 rounded text-xs">python backend.py</code>
                            </div>
                            <div>
                                <p><strong>Alternative - Streamlit:</strong></p>
                                <code class="block bg-red-100 p-2 rounded text-xs">streamlit run app.py</code>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex gap-2 justify-center">
                        <button onclick="location.reload()" class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full font-semibold text-sm">
                            <i class="fas fa-refresh mr-1"></i>
                            Retry Connection
                        </button>
                        <button onclick="generateDemoResults()" class="bg-gray-600 text-white px-4 py-2 rounded-full font-semibold text-sm">
                            <i class="fas fa-play mr-1"></i>
                            Demo Mode
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    // Show AI model unavailable message
    function showAIModelUnavailable() {
        const demoResults = document.getElementById('demo-results');
        if (demoResults) {
            demoResults.innerHTML = `
                <div class="demo-card text-center py-8">
                    <div class="text-4xl mb-3">🤖</div>
                    <h2 class="text-xl font-bold text-orange-600 mb-3">AI Model Unavailable</h2>
                    <p class="text-gray-600 mb-4 text-sm">
                        Gemini AI model is not available. This could be due to:
                    </p>
                    
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <div class="text-xs text-orange-700 text-left space-y-2">
                            <p>• <strong>API Key Issues:</strong> Invalid or missing GEMINI_API_KEY</p>
                            <p>• <strong>Quota Limits:</strong> API quota exceeded for today</p>
                            <p>• <strong>Model Access:</strong> Model not available in your region</p>
                            <p>• <strong>Network Issues:</strong> Connection to Google AI services</p>
                        </div>
                    </div>
                    
                    <div class="flex gap-2 justify-center">
                        <button onclick="location.reload()" class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                            <i class="fas fa-refresh mr-1"></i>
                            Retry
                        </button>
                        <button onclick="generateDemoResults()" class="bg-gray-600 text-white px-4 py-2 rounded-full font-semibold text-sm">
                            <i class="fas fa-play mr-1"></i>
                            Demo Mode
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    // Generate demo results
    function generateDemoResults() {
        if (!selectedFile) return;
        
        const fileName = selectedFile.name;
        const fileSize = selectedFile.size;
        const fileDuration = Math.max(2, Math.floor(fileSize / (1024 * 1024 * 2)));
        const engagementScore = Math.floor(Math.random() * 20) + 75;
        
        const demoResults = document.getElementById('demo-results');
        if (!demoResults) return;
        
        demoResults.innerHTML = `
            <div class="space-y-4">
                <!-- Analysis Header -->
                <div class="text-center mb-6">
                    <h2 class="text-2xl font-bold text-gradient mb-2">Demo Analysis Complete</h2>
                    <p class="text-gray-600 text-sm">Results for: <strong>${fileName}</strong></p>
                    <p class="text-xs text-gray-500">Duration: ~${fileDuration} minutes</p>
                </div>
                
                <!-- Engagement Score -->
                <div class="demo-card">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-lg font-semibold text-gray-800">📊 Engagement Score</h4>
                        <span class="text-2xl font-bold text-gradient">${engagementScore}/100</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-2000" style="width: ${engagementScore}%"></div>
                    </div>
                    <p class="text-gray-600 text-xs">${getEngagementExplanation(engagementScore)}</p>
                </div>
                
                <!-- Timeline Sample -->
                <div class="demo-card">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">🕐 Meeting Timeline</h4>
                    <div class="space-y-2">
                        ${generateTimelineSegments(fileDuration).map(segment => `
                            <div class="timeline-item">
                                <div class="flex items-center justify-between">
                                    <span class="font-medium text-sm" style="color: ${segment.color};">${segment.timeRange} - ${segment.speaker}</span>
                                    <span class="px-2 py-1 rounded-full text-xs" style="background-color: ${segment.sentimentBg}; color: ${segment.sentimentColor};">${segment.sentiment}</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1">${segment.transcript}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Action Items -->
                <div class="demo-card">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">✅ Action Items</h4>
                    <div class="space-y-2">
                        ${generateActionItems().map(item => `
                            <div class="flex items-center justify-between p-2 rounded-lg" style="background-color: ${item.bg};">
                                <span class="text-sm font-medium">${item.description}</span>
                                <span class="px-2 py-1 text-white rounded-full text-xs" style="background-color: ${item.color};">${item.priority}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        showNotification('Demo analysis complete!', 'success');
    }
    
    // Display real results from VERTA
    function displayRealResults(analysisData) {
        if (progressSection) {
            progressSection.classList.add('hidden');
        }
        
        showNotification('Real VERTA analysis complete!', 'success');
        
        const demoResults = document.getElementById('demo-results');
        if (!demoResults) return;
        
        demoResults.innerHTML = `
            <div class="space-y-4">
                <!-- Real Analysis Header -->
                <div class="text-center mb-6">
                    <h2 class="text-2xl font-bold text-gradient mb-2">🔮 Real AI Analysis</h2>
                    <p class="text-gray-600 text-sm">Analyzed with Gemini AI • File: <strong>${selectedFile.name}</strong></p>
                    <div class="bg-green-50 border border-green-200 rounded-lg p-2 mt-3">
                        <p class="text-green-800 text-xs">✅ Real VERTA analysis with all features</p>
                    </div>
                </div>
                
                <!-- Engagement Score -->
                <div class="demo-card">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-lg font-semibold text-gray-800">📊 Engagement Score</h4>
                        <span class="text-2xl font-bold text-gradient">${analysisData.engagement_score.score}/100</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style="width: ${analysisData.engagement_score.score}%"></div>
                    </div>
                    <p class="text-gray-600 text-xs">${analysisData.engagement_score.explanation}</p>
                </div>
                
                <!-- Meeting Timeline -->
                <div class="demo-card">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">🕐 Meeting Timeline</h4>
                    <div class="space-y-2 max-h-64 overflow-y-auto">
                        ${analysisData.segments.map(segment => `
                            <div class="timeline-item">
                                <div class="flex items-center justify-between">
                                    <span class="font-medium text-sm text-${getSpeakerColor(segment.speaker)}-600">${segment.time_range} - ${segment.speaker}</span>
                                    <span class="px-2 py-1 bg-${getSentimentColor(segment.sentiment)}-100 text-${getSentimentColor(segment.sentiment)}-800 rounded-full text-xs">${segment.sentiment}</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1"><strong>Topic:</strong> ${segment.topic}</p>
                                <p class="text-xs text-gray-700 mt-1 italic">"${segment.transcript}"</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Meeting Summary -->
                ${analysisData.meeting_summary ? `
                    <div class="demo-card">
                        <h4 class="text-lg font-semibold text-gray-800 mb-3">📋 Meeting Summary</h4>
                        ${analysisData.meeting_summary.key_points && analysisData.meeting_summary.key_points.length > 0 ? `
                            <div class="mb-3">
                                <h5 class="font-medium text-gray-700 mb-2 text-sm">🎯 Key Points:</h5>
                                <ul class="text-xs text-gray-600 space-y-1">
                                    ${analysisData.meeting_summary.key_points.map(point => `<li>• ${point}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${analysisData.meeting_summary.decisions && analysisData.meeting_summary.decisions.length > 0 ? `
                            <div>
                                <h5 class="font-medium text-gray-700 mb-2 text-sm">✅ Decisions:</h5>
                                <ul class="text-xs text-gray-600 space-y-1">
                                    ${analysisData.meeting_summary.decisions.map(decision => `<li>• ${decision}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                <!-- Action Items -->
                ${analysisData.action_items && analysisData.action_items.length > 0 ? `
                    <div class="demo-card">
                        <h4 class="text-lg font-semibold text-gray-800 mb-3">✅ Action Items</h4>
                        <div class="space-y-2">
                            ${analysisData.action_items.map(item => `
                                <div class="flex items-center justify-between p-2 bg-${getPriorityColor(item.priority)}-50 rounded-lg">
                                    <div class="flex-1">
                                        <span class="text-sm font-medium">${item.description}</span>
                                        <p class="text-xs text-gray-600">Owner: ${item.owner}</p>
                                    </div>
                                    <span class="px-2 py-1 bg-${getPriorityColor(item.priority)}-500 text-white rounded-full text-xs">${item.priority}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // Helper functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function showNotification(message, type) {
        // Simple notification - could be enhanced
        console.log(`${type.toUpperCase()}: ${message}`);
    }
    
    function getEngagementExplanation(score) {
        if (score >= 90) return 'Excellent engagement with active participation';
        if (score >= 80) return 'High engagement with good participation levels';
        if (score >= 70) return 'Moderate engagement with some active participants';
        return 'Lower engagement detected. Consider strategies to increase participation';
    }
    
    function generateTimelineSegments(duration) {
        const segments = [];
        const speakers = ['Speaker A', 'Speaker B', 'Speaker C'];
        const colors = ['#8B5CF6', '#3B82F6', '#10B981'];
        const sentiments = ['Positive', 'Neutral', 'Negative'];
        const transcripts = [
            'Welcome everyone to today\'s meeting...',
            'I have some updates on the project status...',
            'Let\'s discuss the next steps and action items...',
            'Great points everyone. Any questions?'
        ];
        
        const segmentCount = Math.min(4, Math.max(2, Math.floor(duration / 3)));
        
        for (let i = 0; i < segmentCount; i++) {
            const startMinute = Math.floor((duration / segmentCount) * i);
            const endMinute = Math.floor((duration / segmentCount) * (i + 1));
            const speaker = speakers[i % speakers.length];
            const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
            
            segments.push({
                timeRange: `${String(startMinute).padStart(2, '0')}:00–${String(endMinute).padStart(2, '0')}:00`,
                speaker: speaker,
                color: colors[speakers.indexOf(speaker)],
                sentiment: sentiment,
                sentimentBg: sentiment === 'Positive' ? '#DEF7EC' : sentiment === 'Negative' ? '#FEE2E2' : '#F3F4F6',
                sentimentColor: sentiment === 'Positive' ? '#047857' : sentiment === 'Negative' ? '#DC2626' : '#6B7280',
                transcript: transcripts[Math.floor(Math.random() * transcripts.length)]
            });
        }
        
        return segments;
    }
    
    function generateActionItems() {
        const actions = [
            'Review project timeline',
            'Schedule follow-up meeting',
            'Update documentation',
            'Coordinate with stakeholders'
        ];
        
        const priorities = [
            { name: 'High', color: '#ef4444', bg: '#fef2f2' },
            { name: 'Medium', color: '#eab308', bg: '#fefce8' },
            { name: 'Low', color: '#22c55e', bg: '#f0fdf4' }
        ];
        
        const items = [];
        const itemCount = Math.floor(Math.random() * 2) + 2;
        
        for (let i = 0; i < itemCount; i++) {
            const priority = priorities[Math.floor(Math.random() * priorities.length)];
            items.push({
                description: actions[Math.floor(Math.random() * actions.length)],
                priority: priority.name,
                color: priority.color,
                bg: priority.bg
            });
        }
        
        return items;
    }
    
    function getSpeakerColor(speaker) {
        const colors = ['purple', 'blue', 'green', 'yellow'];
        const index = speaker.charCodeAt(speaker.length - 1) % colors.length;
        return colors[index];
    }
    
    function getSentimentColor(sentiment) {
        switch (sentiment.toLowerCase()) {
            case 'positive': return 'green';
            case 'negative': return 'red';
            default: return 'gray';
        }
    }
    
    function getPriorityColor(priority) {
        switch (priority.toLowerCase()) {
            case 'high': return 'red';
            case 'medium': return 'yellow';
            case 'low': return 'green';
            default: return 'gray';
        }
    }
});