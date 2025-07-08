from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum

class ChartType(str, Enum):
    BAR_CHART = "bar_chart"
    LINE_CHART = "line_chart"  
    PIE_CHART = "pie_chart"
    TABLE = "table"
    MIXED_CHART = "mixed_chart"
    UNKNOWN = "unknown"

class AnalysisRequest(BaseModel):
    task_description: str
    image_base64: Optional[str] = None

class ChartAnalysis(BaseModel):
    chart_type: ChartType
    chart_components: Optional[List[str]] = None
    title: Optional[str] = None
    description: str
    key_data_points: List[str]
    trends: List[str]
    comparisons: List[str]
    insights: Optional[List[str]] = None
    raw_data: Optional[Dict[str, Any]] = None

class IELTSWritingResponse(BaseModel):
    introduction: str
    overview: str
    body_paragraphs: List[str]
    full_essay: str
    word_count: int

class AnalysisResponse(BaseModel):
    chart_analysis: ChartAnalysis
    ielts_writing: IELTSWritingResponse
    processing_time: float

class WorkflowState(BaseModel):
    task_description: str
    image_base64: Optional[str] = None
    chart_analysis: Optional[ChartAnalysis] = None
    ielts_writing: Optional[IELTSWritingResponse] = None
    error: Optional[str] = None 