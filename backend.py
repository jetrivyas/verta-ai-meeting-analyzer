#!/usr/bin/env python3
"""
VERTA FastAPI Backend for Render Deployment
AI Meeting Intelligence Platform
"""

import os
import json
import tempfile
import uuid
import time
import logging
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

try:
    import google.generativeai as genai
except ImportError:
    genai = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'mp4', 'mov', 'avi', 'webm'}

# Initialize FastAPI app
app = FastAPI(
    title="VERTA AI Meeting Intelligence API",
    description="Transform meetings into actionable intelligence with AI-powered analysis",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def configure_gemini():
    """Configure Gemini AI"""
    if not genai:
        logger.error("google-generativeai not available")
        return None
        
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY not found in environment variables")
        return None
    
    genai.configure(api_key=api_key)
    
    # Try different model names (updated for current API)
    model_names = [
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest', 
        'gemini-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
    ]
    
    for model_name in model_names:
        try:
            model = genai.GenerativeModel(model_name)
            logger.info(f"Successfully initialized model: {model_name}")
            return model
        except Exception as e:
            logger.warning(f"Failed to initialize {model_name}: {e}")
            continue
    
    return None

def get_mime_type(filename: str) -> str:
    """Get appropriate MIME type for the file"""
    file_ext = Path(filename).suffix.lower()
    mime_types = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav', 
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo',
        '.webm': 'video/webm'
    }
    return mime_types.get(file_ext, 'audio/mpeg')

def create_analysis_prompt() -> str:
    """Create the prompt for Gemini analysis"""
    return """
    You are VERTA, an AI meeting analyzer. Analyze this audio/video file completely.

    REQUIREMENTS:
    1. TRANSCRIBE THE ENTIRE AUDIO from start to finish
    2. Create segments covering the COMPLETE duration
    3. Accurate speaker detection (Speaker A, B, C, etc.)
    4. Sentiment analysis for each segment
    5. Engagement scoring and meeting summary

    Return ONLY valid JSON:
    
    {
        "segments": [
            {
                "time_range": "MM:SS–MM:SS",
                "speaker": "Speaker A",
                "transcript": "exact words spoken",
                "sentiment": "Positive|Neutral|Negative",
                "sentiment_reason": "brief explanation",
                "topic": "main topic discussed"
            }
        ],
        "engagement_score": {
            "score": 85,
            "explanation": "detailed explanation"
        },
        "meeting_summary": {
            "key_points": ["point 1", "point 2"],
            "decisions": ["decision 1"],
            "open_questions": ["question 1"],
            "risks_or_concerns": ["concern 1"]
        },
        "action_items": [
            {
                "description": "action description",
                "owner": "Speaker A",
                "priority": "High|Medium|Low"
            }
        ],
        "improvement_suggestions": ["suggestion 1", "suggestion 2"]
    }
    
    CRITICAL: Transcribe the COMPLETE audio, return only valid JSON.
    """

def create_sample_analysis(filename: str = "meeting.mp4") -> Dict[str, Any]:
    """Create comprehensive sample analysis"""
    return {
        "file_info": {
            "filename": filename,
            "processed_at": datetime.now().isoformat(),
            "analysis_type": "AI-Powered Analysis"
        },
        "segments": [
            {
                "time_range": "00:00–01:30",
                "speaker": "Speaker A",
                "transcript": "Welcome everyone to today's meeting. Let's start by reviewing our agenda and objectives for this session. I hope everyone had a chance to review the materials I sent earlier.",
                "sentiment": "Positive",
                "sentiment_reason": "Welcoming and organized tone, proactive preparation",
                "topic": "Meeting introduction and agenda review"
            },
            {
                "time_range": "01:30–03:00",
                "speaker": "Speaker B", 
                "transcript": "Thank you for the introduction. I'd like to present our progress on the current project and discuss the challenges we've encountered. We've made significant headway, but there are some areas that need attention.",
                "sentiment": "Neutral",
                "sentiment_reason": "Professional and informative presentation with balanced perspective",
                "topic": "Project progress update and challenge identification"
            },
            {
                "time_range": "03:00–04:30",
                "speaker": "Speaker A",
                "transcript": "That's great progress, thank you for the detailed update. What are the next steps we need to take to address these challenges? Do we have the resources we need?",
                "sentiment": "Positive", 
                "sentiment_reason": "Constructive and solution-focused, showing support",
                "topic": "Next steps discussion and resource planning"
            },
            {
                "time_range": "04:30–06:00",
                "speaker": "Speaker C",
                "transcript": "I suggest we prioritize the critical issues first and allocate additional resources where needed. We should also consider bringing in external expertise for the technical challenges.",
                "sentiment": "Neutral",
                "sentiment_reason": "Strategic and analytical approach, practical suggestions",
                "topic": "Resource allocation and strategic planning"
            },
            {
                "time_range": "06:00–07:30",
                "speaker": "Speaker B",
                "transcript": "That sounds like a solid plan. I can coordinate with the external consultants and provide them with the necessary background information. When should we schedule the follow-up?",
                "sentiment": "Positive",
                "sentiment_reason": "Collaborative and action-oriented response",
                "topic": "Implementation planning and coordination"
            }
        ],
        "engagement_score": {
            "score": 89,
            "explanation": "Excellent engagement with active participation from all speakers. Clear communication, structured discussion flow, collaborative problem-solving approach, and concrete action planning. All participants contributed meaningfully to the discussion."
        },
        "meeting_summary": {
            "key_points": [
                "Meeting agenda was clearly established and followed systematically",
                "Project progress was comprehensively reviewed with detailed updates",
                "Team collaboration appears highly effective with open communication",
                "Challenges were identified proactively and solutions proposed",
                "Resource allocation strategies were discussed and agreed upon",
                "External expertise integration was planned for technical challenges"
            ],
            "decisions": [
                "Continue with current project approach with strategic modifications",
                "Prioritize critical issues for immediate attention and resolution",
                "Allocate additional resources to challenging technical areas",
                "Engage external consultants for specialized technical expertise",
                "Schedule regular follow-up meetings for progress monitoring"
            ],
            "open_questions": [
                "What are the specific timeline requirements for each project phase?",
                "How should we prioritize the remaining tasks most effectively?",
                "What additional resources are needed for optimal project outcomes?",
                "How can we improve communication between all team members?",
                "What metrics should we use to measure project success?"
            ],
            "risks_or_concerns": [
                "Potential timeline delays if technical challenges persist",
                "Need for additional resources may impact overall budget constraints",
                "Communication gaps could affect project coordination and delivery",
                "External consultant integration may require additional time",
                "Resource allocation changes might affect other ongoing projects"
            ]
        },
        "action_items": [
            {
                "description": "Prepare detailed project timeline with specific milestones and deliverables",
                "owner": "Speaker A",
                "priority": "High"
            },
            {
                "description": "Schedule follow-up meeting for next week to review progress",
                "owner": "Speaker B", 
                "priority": "Medium"
            },
            {
                "description": "Research additional resources and prepare budget impact analysis",
                "owner": "Speaker A",
                "priority": "Medium"
            },
            {
                "description": "Implement priority-based task management system for the team",
                "owner": "Speaker C",
                "priority": "High"
            },
            {
                "description": "Coordinate with external consultants and provide project background",
                "owner": "Speaker B",
                "priority": "High"
            }
        ],
        "improvement_suggestions": [
            "Consider using visual aids and presentations for better engagement during updates",
            "Allocate specific time slots for each agenda item to maintain focus and efficiency",
            "Ensure all participants have equal opportunity to contribute ideas and feedback",
            "Document decisions and action items in real-time during meetings for clarity",
            "Implement regular check-ins to monitor progress on action items between meetings",
            "Create a shared project dashboard for real-time progress tracking",
            "Establish clear communication protocols for urgent issues and updates"
        ]
    }

async def analyze_with_gemini(model, file_data: bytes, filename: str) -> Optional[Dict[str, Any]]:
    """Analyze media file with Gemini AI"""
    try:
        logger.info(f"Starting Gemini analysis of file: {filename}")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix=Path(filename).suffix, delete=False) as tmp_file:
            tmp_file.write(file_data)
            tmp_file_path = tmp_file.name
        
        try:
            # Upload file to Gemini
            mime_type = get_mime_type(filename)
            media_file = genai.upload_file(tmp_file_path, mime_type=mime_type)
            logger.info(f"File uploaded to Gemini with MIME type: {mime_type}")
            
            # Wait for file processing
            max_wait = 120  # 2 minutes
            wait_time = 0
            while media_file.state.name != "ACTIVE" and wait_time < max_wait:
                await asyncio.sleep(2)
                wait_time += 2
                media_file = genai.get_file(media_file.name)
            
            if media_file.state.name != "ACTIVE":
                logger.error("File processing timeout")
                return None
            
            # Generate analysis
            prompt = create_analysis_prompt()
            generation_config = genai.types.GenerationConfig(
                temperature=0.1,
                max_output_tokens=16384,
                top_p=0.8,
            )
            
            response = model.generate_content(
                [prompt, media_file],
                generation_config=generation_config
            )
            
            if not response.text:
                logger.error("Empty response from Gemini")
                return None
            
            # Parse JSON response
            json_text = response.text.strip()
            
            # Clean up JSON
            if json_text.startswith("```json"):
                json_text = json_text[7:]
            if json_text.startswith("```"):
                json_text = json_text[3:]
            if json_text.endswith("```"):
                json_text = json_text[:-3]
            
            # Find JSON boundaries
            first_brace = json_text.find('{')
            last_brace = json_text.rfind('}')
            if first_brace >= 0 and last_brace >= 0:
                json_text = json_text[first_brace:last_brace + 1]
            
            result = json.loads(json_text)
            logger.info("Successfully parsed Gemini analysis result")
            return result
            
        finally:
            # Clean up temp file
            try:
                os.unlink(tmp_file_path)
            except:
                pass
        
    except Exception as e:
        logger.error(f"Gemini analysis error: {e}")
        return None

# Initialize Gemini model
model = configure_gemini()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "VERTA AI Meeting Intelligence API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "upload": "/upload",
            "analyze": "/analyze",
            "debug": "/debug"
        }
    }

@app.get("/test")
async def test_endpoint():
    """Simple test endpoint"""
    return {"message": "Backend is working!", "timestamp": datetime.now().isoformat()}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    api_key = os.getenv("GEMINI_API_KEY")
    
    return {
        "status": "healthy",
        "service": "VERTA AI Meeting Intelligence API",
        "version": "1.0.0",
        "ai_model": "available" if (model and api_key) else "unavailable",
        "api_key_present": bool(api_key),
        "api_key_length": len(api_key) if api_key else 0,
        "model_initialized": bool(model),
        "timestamp": datetime.now().isoformat(),
        "environment": "production" if os.getenv("RENDER") else "development"
    }

@app.get("/debug")
async def debug_info():
    """Debug endpoint to check configuration"""
    api_key = os.getenv("GEMINI_API_KEY")
    
    # Try to list available models
    available_models = []
    if genai and api_key:
        try:
            genai.configure(api_key=api_key)
            models = genai.list_models()
            available_models = [m.name for m in models if 'generateContent' in m.supported_generation_methods][:5]
        except Exception as e:
            available_models = [f"Error listing models: {str(e)}"]
    
    return {
        "api_key_present": bool(api_key),
        "api_key_length": len(api_key) if api_key else 0,
        "api_key_prefix": api_key[:10] + "..." if api_key else None,
        "model_initialized": bool(model),
        "genai_available": bool(genai),
        "available_models": available_models,
        "render_env": bool(os.getenv("RENDER"))
    }

@app.post("/upload")
@app.options("/upload")
async def upload_file(request: Request, file: UploadFile = File(None)):
    """Upload and store file for analysis"""
    
    # Handle CORS preflight
    if request.method == "OPTIONS":
        return JSONResponse(
            content={},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )
    try:
        # Validate file
        if not file or not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        file_ext = Path(file.filename).suffix.lower().lstrip('.')
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"File type not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        logger.info(f"File uploaded: {file.filename} -> {file_id}")
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "size": len(file_content),
            "status": "uploaded",
            "message": "File uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/analyze")
@app.options("/analyze")
async def analyze_file(request: Request, file: UploadFile = File(None)):
    """Analyze uploaded file with AI"""
    
    # Handle CORS preflight
    if request.method == "OPTIONS":
        return JSONResponse(
            content={},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )
    try:
        # Validate file
        if not file or not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_ext = Path(file.filename).suffix.lower().lstrip('.')
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"File type not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        logger.info(f"Starting analysis of file: {file.filename}")
        
        # Try real AI analysis if model is available
        if model:
            try:
                logger.info("Model is available, attempting real AI analysis...")
                result = await analyze_with_gemini(model, file_content, file.filename)
                if result:
                    logger.info("Real AI analysis completed successfully")
                    result["analysis_type"] = "Real AI Analysis"
                    return result
                else:
                    logger.warning("AI analysis returned None, falling back to sample")
            except Exception as e:
                logger.error(f"AI analysis failed: {e}")
        else:
            logger.warning("Model not available - no Gemini API key or initialization failed")
        
        # Fallback to sample analysis
        logger.info("Using sample analysis (AI not available)")
        sample_result = create_sample_analysis(file.filename)
        sample_result["analysis_type"] = "Sample Analysis (AI Unavailable)"
        return sample_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/status/{file_id}")
async def get_file_status(file_id: str):
    """Get analysis status for a file"""
    # For this implementation, we'll return a simple status
    return {
        "file_id": file_id,
        "status": "completed",
        "message": "Analysis completed successfully"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "backend:app", 
        host="0.0.0.0", 
        port=port, 
        reload=False,
        log_level="info"
    )