from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import base64
import io
from PIL import Image
import uvicorn
import traceback

from app.models.schemas import AnalysisRequest, AnalysisResponse
from app.services.langgraph_workflow import IELTSAnalysisWorkflow

# Tạo FastAPI app
app = FastAPI(
    title="IELTS Writing Task 1 AI Assistant",
    description="AI-powered IELTS Writing Task 1 analysis with LangGraph",
    version="1.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize workflow
workflow = IELTSAnalysisWorkflow()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "IELTS Writing Task 1 AI Assistant API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Test Gemini service initialization
        from app.services.gemini_service import GeminiService
        gemini_service = GeminiService()
        
        return {
            "status": "healthy",
            "services": {
                "fastapi": "running",
                "gemini": "connected",
                "langgraph": "initialized"
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "error": str(e),
            "services": {
                "fastapi": "running",
                "gemini": "error",
                "langgraph": "unknown"
            }
        }

@app.post("/analyze", response_model=dict)
async def analyze_ielts_task(
    task_description: str = Form(..., description="IELTS Writing Task 1 description"),
    chart_image: UploadFile = File(..., description="Chart/graph image file")
):
    """
    Analyze IELTS Writing Task 1 with chart image
    
    This endpoint:
    1. Receives a task description and chart image
    2. Uses LangGraph workflow to process the request
    3. Returns structured analysis and IELTS writing sample
    """
    
    try:
        # Validate file type
        if not chart_image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400, 
                detail="File must be an image (PNG, JPG, JPEG, etc.)"
            )
        
        # Read and validate image
        image_data = await chart_image.read()
        
        try:
            # Validate image can be opened
            image = Image.open(io.BytesIO(image_data))
            image.verify()  # Verify it's a valid image
            
            # Re-open image after verify (verify closes the file)
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary (for JPEG compatibility)
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to base64
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG', quality=95)
            image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image file: {str(e)}"
            )
        
        # Process through LangGraph workflow
        print(f"🚀 Processing IELTS analysis request...")
        print(f"📝 Task: {task_description[:100]}...")
        print(f"🖼️ Image size: {len(image_data)} bytes")
        
        result = await workflow.process_request(
            task_description=task_description,
            image_base64=image_base64
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {result.get('error', 'Unknown error')}"
            )
        
        # Return successful result
        response = {
            "success": True,
            "data": {
                "chart_analysis": result["chart_analysis"],
                "ielts_writing": result["ielts_writing"],
                "processing_time": result["processing_time"]
            },
            "metadata": {
                "task_description": task_description,
                "image_info": {
                    "filename": chart_image.filename,
                    "size_bytes": len(image_data),
                    "content_type": chart_image.content_type
                }
            }
        }
        
        print(f"✅ Analysis completed successfully in {result['processing_time']:.2f}s")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/analyze-json", response_model=dict)
async def analyze_ielts_json(request: AnalysisRequest):
    """
    Alternative endpoint that accepts JSON payload with base64 image
    """
    try:
        if not request.image_base64:
            raise HTTPException(
                status_code=400,
                detail="image_base64 is required"
            )
        
        result = await workflow.process_request(
            task_description=request.task_description,
            image_base64=request.image_base64
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {result.get('error', 'Unknown error')}"
            )
        
        return {
            "success": True,
            "data": {
                "chart_analysis": result["chart_analysis"],
                "ielts_writing": result["ielts_writing"],
                "processing_time": result["processing_time"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in JSON endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/workflow-info")
async def get_workflow_info():
    """
    Get information about the LangGraph workflow
    """
    return {
        "workflow_name": "IELTS Writing Task 1 Analysis",
        "description": "Multi-step AI workflow for analyzing charts and generating IELTS Writing Task 1 essays",
        "steps": [
            {
                "step": 1,
                "name": "validate_input",
                "description": "Validate input task description and image"
            },
            {
                "step": 2, 
                "name": "analyze_chart",
                "description": "Analyze chart image using Gemini Vision API"
            },
            {
                "step": 3,
                "name": "process_data", 
                "description": "Process and structure extracted data"
            },
            {
                "step": 4,
                "name": "generate_writing",
                "description": "Generate IELTS Writing Task 1 essay"
            },
            {
                "step": 5,
                "name": "finalize_result",
                "description": "Finalize and format results"
            }
        ],
        "technologies": [
            "LangGraph for workflow orchestration",
            "Google Gemini API for AI analysis",
            "FastAPI for web service",
            "Pydantic for data validation"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0", 
        port=8000,
        reload=True,
        log_level="info"
    ) 