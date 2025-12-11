// VERTA - AI Meeting Intelligence Platform
// Fixed Frontend JavaScript for Real Backend Integration

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

// VERTA Backend Configuration
const BACKEND_URL = 'https://verta-ai.onrender.com';

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
    const resultsSection = document.getElementById('demo-results');
    
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
    
    // Start analysis with real backend integration
    async function startAnalysis() {
        console.log('🔮 VERTA: Starting analysis...');
        console.log('Backend URL:', BACKEND_URL);
        console.log('Selected file:', selectedFile.name, selectedFile.size, 'bytes');
        
        if (analyzeBtn && progressSection && resultsSection) {
            analyzeBtn.classList.add('hidden');
            progressSection.classList.remove('hidden');
            resultsSection.innerHTML = ''; // Clear previous results
            
            try {
                // Step 1: Check backend health
                updateProgress(5, 'Connecting to VERTA backend...');
                console.log('🔍 Checking backend health...');
                
                const healthUrl = `${BACKEND_URL}/health`;
                console.log('Health check URL:', healthUrl);
                
                const healthResponse = await fetch(healthUrl, {
                    method: 'GET',
                    mode: 'cors'
                });
                
                console.log('Health response status:', healthResponse.status);
                console.log('Health response headers:', Object.fromEntries(healthResponse.headers.entries()));
                
                if (!healthResponse.ok) {
                    throw new Error(`Backend health check failed: ${healthResponse.status}`);
                }
                
                const healthData = await healthResponse.json();
                console.log('✅ Backend health data:', healthData);
                
                updateProgress(15, 'Backend connected successfully...');
                
                // Step 2: Upload and analyze file
                updateProgress(25, 'Uploading file for analysis...');
                console.log('📤 Uploading file to backend...');
                
                const formData = new FormData();
                formData.append('file', selectedFile);
                
                const analyzeUrl = `${BACKEND_URL}/analyze`;
                console.log('Analyze URL:', analyzeUrl);
                console.log('FormData file:', selectedFile.name);
                
                const analyzeResponse = await fetch(analyzeUrl, {
                    method: 'POST',
                    mode: 'cors',
                    body: formData
                });
                
                console.log('Analyze response status:', analyzeResponse.status);
                console.log('Analyze response headers:', Object.fromEntries(analyzeResponse.headers.entries()));
                
                if (!analyzeResponse.ok) {
                    const errorText = await analyzeResponse.text();
                    console.error('❌ Analyze response error:', errorText);
                    throw new Error(`Analysis failed: ${analyzeResponse.status} - ${errorText}`);
                }
                
                updateProgress(60, 'Processing AI analysis...');
                
                const analysisResult = await analyzeResponse.json();
                console.log('✅ Full analysis result:', analysisResult);
                
                updateProgress(90, 'Preparing results...');
                
                // Step 3: Display real results
                setTimeout(() => {
                    updateProgress(100, 'Analysis complete!');
                    setTimeout(() => {
                        displayRealAnalysisResults(analysisResult);
                        progressSection.classList.add('hidden');
                    }, 1000);
                }, 500);
                
            } catch (error) {
                console.error('❌ VERTA Analysis Error:', error);
                progressSection.classList.add('hidden');
                analyzeBtn.classList.remove('hidden');
                
                showAnalysisError(error.message);
            }
        }
    }
    
    // Display real analysis results from backend
    function displayRealAnalysisResults(data) {
        console.log('🎨 Displaying real analysis results:', data);
        
        if (!resultsSection) {
            console.error('Results section not found');
            return;
        }
        
        // Extract data from backend response
        const fileInfo = data.file_info || {};
        const segments = data.segments || [];
        const engagementScore = data.engagement_score || {};
        const meetingSummary = data.meeting_summary || {};
        const actionItems = data.action_items || [];
        const suggestions = data.improvement_suggestions || [];
        
        const resultsHTML = `
            <div class="space-y-6">
                <!-- Analysis Header -->
                <div class="text-center mb-6">
                    <h2 class="text-3xl font-bold text-gradient mb-2">🔮 VERTA Analysis Complete</h2>
                    <p class="text-gray-600">Results for: <strong>${fileInfo.filename || 'Unknown file'}</strong></p>
                    <p class="text-sm text-gray-500">Processed: ${fileInfo.processed_at || 'Unknown time'}</p>
                    <div class="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        ${fileInfo.analysis_type || 'AI Analysis'}
                    </div>
                </div>
                
                <!-- Engagement Score -->
                <div class="demo-card">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-semibold text-gray-800">📊 Engagement Score</h3>
                        <span class="text-3xl font-bold text-gradient">${engagementScore.score || 0}/100</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
                        <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000" 
                             style="width: ${engagementScore.score || 0}%"></div>
                    </div>
                    <p class="text-gray-600 text-sm">${engagementScore.explanation || 'No explanation available'}</p>
                </div>
                
                <!-- Meeting Transcript -->
                <div class="demo-card">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">🎤 Meeting Transcript</h3>
                    <div class="space-y-3 max-h-64 overflow-y-auto">
                        ${segments.map(segment => `
                            <div class="border-l-4 border-blue-500 pl-4 py-2">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="font-medium text-blue-600">${segment.time_range || 'Unknown'} - ${segment.speaker || 'Unknown'}</span>
                                    <span class="px-2 py-1 text-xs rounded-full ${getSentimentClass(segment.sentiment)}">${segment.sentiment || 'Neutral'}</span>
                                </div>
                                <p class="text-sm text-gray-700 mb-1"><strong>Topic:</strong> ${segment.topic || 'Unknown'}</p>
                                <p class="text-sm text-gray-600 italic">"${segment.transcript || 'No transcript available'}"</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Meeting Summary -->
                <div class="demo-card">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">📋 Meeting Summary</h3>
                    
                    ${meetingSummary.key_points && meetingSummary.key_points.length > 0 ? `
                        <div class="mb-4">
                            <h4 class="font-medium text-gray-700 mb-2">🎯 Key Points:</h4>
                            <ul class="text-sm text-gray-600 space-y-1">
                                ${meetingSummary.key_points.map(point => `<li class="flex items-start"><span class="text-blue-500 mr-2">•</span>${point}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${meetingSummary.decisions && meetingSummary.decisions.length > 0 ? `
                        <div class="mb-4">
                            <h4 class="font-medium text-gray-700 mb-2">✅ Decisions Made:</h4>
                            <ul class="text-sm text-gray-600 space-y-1">
                                ${meetingSummary.decisions.map(decision => `<li class="flex items-start"><span class="text-green-500 mr-2">•</span>${decision}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${meetingSummary.open_questions && meetingSummary.open_questions.length > 0 ? `
                        <div class="mb-4">
                            <h4 class="font-medium text-gray-700 mb-2">❓ Open Questions:</h4>
                            <ul class="text-sm text-gray-600 space-y-1">
                                ${meetingSummary.open_questions.map(question => `<li class="flex items-start"><span class="text-yellow-500 mr-2">•</span>${question}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${meetingSummary.risks_or_concerns && meetingSummary.risks_or_concerns.length > 0 ? `
                        <div>
                            <h4 class="font-medium text-gray-700 mb-2">⚠️ Risks & Concerns:</h4>
                            <ul class="text-sm text-gray-600 space-y-1">
                                ${meetingSummary.risks_or_concerns.map(risk => `<li class="flex items-start"><span class="text-red-500 mr-2">•</span>${risk}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Action Items -->
                ${actionItems.length > 0 ? `
                    <div class="demo-card">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">✅ Action Items</h3>
                        <div class="space-y-3">
                            ${actionItems.map(item => `
                                <div class="flex items-center justify-between p-3 rounded-lg ${getPriorityBg(item.priority)}">
                                    <div class="flex-1">
                                        <p class="font-medium text-gray-800">${item.description || 'No description'}</p>
                                        <p class="text-sm text-gray-600">Owner: ${item.owner || 'Unassigned'}</p>
                                    </div>
                                    <span class="px-3 py-1 text-white rounded-full text-sm ${getPriorityColor(item.priority)}">${item.priority || 'Medium'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Improvement Suggestions -->
                ${suggestions.length > 0 ? `
                    <div class="demo-card">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">💡 Improvement Suggestions</h3>
                        <div class="space-y-2">
                            ${suggestions.map(suggestion => `
                                <div class="flex items-start">
                                    <span class="text-yellow-500 mr-2 mt-1">💡</span>
                                    <p class="text-sm text-gray-600">${suggestion}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        resultsSection.innerHTML = resultsHTML;
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        showNotification('✅ Analysis complete! Real results from VERTA AI.', 'success');
    }
    
    // Show analysis error
    function showAnalysisError(errorMessage) {
        if (!resultsSection) return;
        
        resultsSection.innerHTML = `
            <div class="demo-card text-center py-8">
                <div class="text-4xl mb-3">❌</div>
                <h2 class="text-xl font-bold text-red-600 mb-3">Analysis Failed</h2>
                <p class="text-gray-600 mb-4">${errorMessage}</p>
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 class="font-semibold text-red-800 mb-2">Troubleshooting:</h3>
                    <ul class="text-sm text-red-700 text-left space-y-1">
                        <li>• Check your internet connection</li>
                        <li>• Try with a smaller file (under 50MB)</li>
                        <li>• Ensure file is MP3, WAV, MP4, MOV, AVI, or WebM</li>
                        <li>• Check browser console for detailed errors</li>
                    </ul>
                </div>
                <button onclick="location.reload()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-full">
                    Try Again
                </button>
            </div>
        `;
    }
    
    // Update progress bar
    function updateProgress(percent, message) {
        if (progressBar && progressText) {
            progressBar.style.width = percent + '%';
            progressText.textContent = `${Math.round(percent)}% - ${message}`;
        }
    }
    
    // Helper functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function getSentimentClass(sentiment) {
        switch (sentiment?.toLowerCase()) {
            case 'positive': return 'bg-green-100 text-green-800';
            case 'negative': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    
    function getPriorityColor(priority) {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    }
    
    function getPriorityBg(priority) {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-50';
            case 'medium': return 'bg-yellow-50';
            case 'low': return 'bg-green-50';
            default: return 'bg-gray-50';
        }
    }
    
    function showNotification(message, type) {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
});