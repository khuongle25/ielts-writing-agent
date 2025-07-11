from langgraph.graph import StateGraph, END
from langgraph.graph.graph import CompiledGraph
from langchain.schema import BaseMessage
from typing import TypedDict, Annotated, Dict, Any
import time
import json

from app.models.schemas import WorkflowState, ChartAnalysis, IELTSWritingResponse, ChartType
from app.services.gemini_service import GeminiService

# Định nghĩa state cho workflow
class IELTSWorkflowState(TypedDict):
    task_description: str
    image_base64: str
    chart_analysis: Dict[str, Any]
    ielts_writing: Dict[str, Any] 
    error: str
    processing_step: str

class IELTSAnalysisWorkflow:
    def __init__(self):
        self.gemini_service = GeminiService()
        self.workflow = self._create_workflow()
    
    def _create_workflow(self) -> CompiledGraph:
        """
        Tạo LangGraph workflow cho việc phân tích IELTS Writing Task 1
        
        Workflow gồm các bước:
        1. validate_input: Kiểm tra input
        2. analyze_chart: Phân tích biểu đồ từ ảnh
        3. process_data: Xử lý và cấu trúc lại dữ liệu  
        4. generate_writing: Tạo bài viết IELTS
        5. finalize_result: Tổng hợp kết quả cuối
        """
        
        # Tạo workflow graph
        workflow = StateGraph(IELTSWorkflowState)
        
        # Thêm các nodes
        workflow.add_node("validate_input", self.validate_input_node)
        workflow.add_node("analyze_chart", self.analyze_chart_node)  
        workflow.add_node("process_data", self.process_data_node)
        workflow.add_node("generate_writing", self.generate_writing_node)
        workflow.add_node("finalize_result", self.finalize_result_node)
        workflow.add_node("handle_error", self.handle_error_node)
        
        # Định nghĩa edges (luồng chạy)
        workflow.set_entry_point("validate_input")
        
        # Conditional routing từ validate_input
        workflow.add_conditional_edges(
            "validate_input",
            self.should_continue_after_validation,
            {
                "continue": "analyze_chart",
                "error": "handle_error"
            }
        )
        
        # Conditional routing từ analyze_chart  
        workflow.add_conditional_edges(
            "analyze_chart",
            self.should_continue_after_analysis,
            {
                "continue": "process_data", 
                "error": "handle_error"
            }
        )
        
        # Linear flow từ process_data
        workflow.add_edge("process_data", "generate_writing")
        workflow.add_edge("generate_writing", "finalize_result")
        workflow.add_edge("finalize_result", END)
        workflow.add_edge("handle_error", END)
        
        return workflow.compile()
    
    def validate_input_node(self, state: IELTSWorkflowState) -> IELTSWorkflowState:
        """
        Node 1: Validate input data
        """
        print("🔍 Validating input...")
        state["processing_step"] = "Validating input"
        
        try:
            if not state.get("task_description"):
                state["error"] = "Task description is required"
                return state
                
            if not state.get("image_base64"):
                state["error"] = "Chart image is required" 
                return state
            
            print("✅ Input validation successful")
            return state
            
        except Exception as e:
            state["error"] = f"Input validation failed: {str(e)}"
            return state
    
    def analyze_chart_node(self, state: IELTSWorkflowState) -> IELTSWorkflowState:
        """
        Node 2: Analyze chart image using Gemini Vision API
        """
        print("📊 Analyzing chart image...")
        state["processing_step"] = "Analyzing chart"
        
        try:
            chart_analysis = self.gemini_service.analyze_chart_image(
                state["image_base64"], 
                state["task_description"]
            )
            
            state["chart_analysis"] = chart_analysis
            print(f"✅ Chart analysis complete: {chart_analysis.get('chart_type', 'unknown')}")
            return state
            
        except Exception as e:
            state["error"] = f"Chart analysis failed: {str(e)}"
            return state
    
    def process_data_node(self, state: IELTSWorkflowState) -> IELTSWorkflowState:
        """
        Node 3: Process and structure the analyzed data
        """
        print("⚙️ Processing extracted data...")
        state["processing_step"] = "Processing data"
        
        try:
            chart_analysis = state["chart_analysis"]
            
            # Validate and enhance chart analysis
            if not chart_analysis.get("key_data_points"):
                chart_analysis["key_data_points"] = ["No specific data points extracted"]
            
            if not chart_analysis.get("trends"):
                chart_analysis["trends"] = ["No clear trends identified"]
                
            if not chart_analysis.get("comparisons"):
                chart_analysis["comparisons"] = ["No significant comparisons found"]
            
            # Ensure chart_type is valid
            valid_types = ["bar_chart", "line_chart", "pie_chart", "table", "mixed_chart", "unknown"]
            if chart_analysis.get("chart_type") not in valid_types:
                chart_analysis["chart_type"] = "unknown"
            
            state["chart_analysis"] = chart_analysis
            print("✅ Data processing complete")
            return state
            
        except Exception as e:
            state["error"] = f"Data processing failed: {str(e)}"
            return state
    
    def generate_writing_node(self, state: IELTSWorkflowState) -> IELTSWorkflowState:
        """
        Node 4: Generate IELTS Writing Task 1 essay
        """
        print("✍️ Generating IELTS writing...")
        state["processing_step"] = "Generating IELTS writing"
        
        try:
            ielts_writing = self.gemini_service.generate_ielts_writing(
                state["chart_analysis"],
                state["task_description"]
            )
            
            state["ielts_writing"] = ielts_writing
            print(f"✅ IELTS writing complete ({ielts_writing.get('word_count', 0)} words)")
            return state
            
        except Exception as e:
            state["error"] = f"IELTS writing generation failed: {str(e)}"
            return state
    
    def finalize_result_node(self, state: IELTSWorkflowState) -> IELTSWorkflowState:
        """
        Node 5: Finalize and format the final result
        """
        print("🎯 Finalizing results...")
        state["processing_step"] = "Finalizing results"
        
        try:
            # Final validation and formatting
            chart_analysis = state["chart_analysis"]
            ielts_writing = state["ielts_writing"]
            
            # Ensure all required fields are present
            if not ielts_writing.get("full_essay"):
                ielts_writing["full_essay"] = "Essay generation incomplete"
            
            if not isinstance(ielts_writing.get("word_count"), int):
                ielts_writing["word_count"] = len(ielts_writing.get("full_essay", "").split())
            
            print("✅ Results finalized successfully")
            return state
            
        except Exception as e:
            state["error"] = f"Result finalization failed: {str(e)}"
            return state
    
    def handle_error_node(self, state: IELTSWorkflowState) -> IELTSWorkflowState:
        """
        Error handling node
        """
        print(f"❌ Error occurred: {state.get('error', 'Unknown error')}")
        state["processing_step"] = "Error occurred"
        return state
    
    # Conditional routing functions
    def should_continue_after_validation(self, state: IELTSWorkflowState) -> str:
        """Routing logic after input validation"""
        if state.get("error"):
            return "error"
        return "continue"
    
    def should_continue_after_analysis(self, state: IELTSWorkflowState) -> str:
        """Routing logic after chart analysis"""
        if state.get("error"):
            return "error"
        return "continue"
    
    async def process_request(self, task_description: str, image_base64: str) -> Dict[str, Any]:
        """
        Main method to process IELTS analysis request
        """
        start_time = time.time()
        
        # Initial state
        initial_state = IELTSWorkflowState(
            task_description=task_description,
            image_base64=image_base64,
            chart_analysis={},
            ielts_writing={},
            error="",
            processing_step=""
        )
        
        try:
            # Run the workflow
            print("🚀 Starting IELTS Analysis Workflow...")
            final_state = self.workflow.invoke(initial_state)
            
            processing_time = time.time() - start_time
            
            if final_state.get("error"):
                return {
                    "success": False,
                    "error": final_state["error"],
                    "processing_time": processing_time
                }
            
            # Convert to response format
            chart_analysis = ChartAnalysis(
                chart_type=ChartType(final_state["chart_analysis"].get("chart_type", "unknown")),
                title=final_state["chart_analysis"].get("title"),
                description=final_state["chart_analysis"].get("description", ""),
                key_data_points=final_state["chart_analysis"].get("key_data_points", []),
                trends=final_state["chart_analysis"].get("trends", []),
                comparisons=final_state["chart_analysis"].get("comparisons", []),
                raw_data=final_state["chart_analysis"].get("raw_data")
            )
            
            ielts_writing = IELTSWritingResponse(
                introduction=final_state["ielts_writing"].get("introduction", ""),
                overview=final_state["ielts_writing"].get("overview", ""),
                body_paragraphs=final_state["ielts_writing"].get("body_paragraphs", []),
                full_essay=final_state["ielts_writing"].get("full_essay", ""),
                word_count=final_state["ielts_writing"].get("word_count", 0)
            )
            
            return {
                "success": True,
                "chart_analysis": chart_analysis.dict(),
                "ielts_writing": ielts_writing.dict(),
                "processing_time": processing_time
            }
            
        except Exception as e:
            processing_time = time.time() - start_time
            print(f"❌ Workflow failed: {str(e)}")
            return {
                "success": False,
                "error": f"Workflow execution failed: {str(e)}",
                "processing_time": processing_time
            } 