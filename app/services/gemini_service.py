import google.generativeai as genai
import base64
import io
from PIL import Image
from typing import Optional, Dict, Any
import json
import os
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.vision_model = genai.GenerativeModel('gemini-1.5-flash')

    def analyze_chart_image(self, image_base64: str, task_description: str) -> Dict[str, Any]:
        """
        Phân tích biểu đồ từ ảnh và trích xuất thông tin
        """
        try:
            # Decode base64 image
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            
            prompt = f"""
            Phân tích biểu đồ trong ảnh này theo đề bài IELTS Writing Task 1: "{task_description}"

            QUAN TRỌNG: Ảnh có thể chứa NHIỀU biểu đồ khác nhau (pie chart, bar chart, line chart, table). 
            Hãy phân tích TẤT CẢ các biểu đồ có trong ảnh và tích hợp thông tin.

            Hãy trả về kết quả trong format JSON với các thông tin sau:
            {{
                "chart_type": "loại biểu đồ chính (bar_chart/line_chart/pie_chart/table/mixed_chart)",
                "chart_components": ["pie_chart", "bar_chart"],
                "title": "tiêu đề chung của hình",
                "description": "mô tả chi tiết về TẤT CẢ biểu đồ trong ảnh",
                "key_data_points": [
                    "U.S.A accounted for 48% of global bottled water consumption in 1999",
                    "Asia showed 14% growth in bottled water consumption in 2001"
                ],
                "trends": ["các xu hướng chính từ TẤT CẢ dữ liệu"],
                "comparisons": ["so sánh giữa các nhóm dữ liệu và giữa các biểu đồ"],
                "insights": ["những insight sâu sắc từ việc kết hợp nhiều biểu đồ"],
                "raw_data": {{"dữ liệu thô từ TẤT CẢ biểu đồ"}}
            }}

            QUAN TRỌNG - Format yêu cầu:
            - key_data_points: PHẢI là array of strings, KHÔNG được là objects
            - Mỗi data point là 1 câu hoàn chỉnh có số liệu cụ thể
            - VD: "The U.S.A dominated with 48% of consumption in 1999"
            - KHÔNG viết: {{"region": "U.S.A", "value": "48%"}}
            - chart_components: Chỉ tên loại chart như "pie_chart", "bar_chart"

            Hướng dẫn phân tích chi tiết:
            1. XÁC ĐỊNH TẤT CẢ BIỂU ĐỒ: Đếm và mô tả từng biểu đồ trong ảnh
            2. ĐỌC SỐ LIỆU CHÍNH XÁC: Trích xuất tất cả con số, phần trăm, năm tháng
            3. TÌM MỐI LIÊN HỆ: Phân tích mối quan hệ giữa các biểu đồ
            4. SO SÁNH ĐA CHIỀU: So sánh theo thời gian, theo nhóm, theo biểu đồ
            5. XU HƯỚNG TỔNG THỂ: Tìm patterns từ việc kết hợp multiple charts
            6. INSIGHTS SÂU: Đưa ra nhận xét thông minh từ multiple data sources

            Ví dụ cho mixed chart: Nếu có pie chart + bar chart, hãy phân tích:
            - Pie chart: phân bố tại 1 thời điểm
            - Bar chart: thay đổi theo thời gian hoặc so sánh groups
            - Mối liên hệ: regions nào dominant trong pie chart có growth như thế nào trong bar chart
            """

            response = self.vision_model.generate_content([prompt, image])
            
            # Extract JSON from response
            response_text = response.text
            # Tìm JSON block trong response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                # Fallback if no JSON found
                return {
                    "chart_type": "unknown",
                    "chart_components": [],
                    "title": "Unable to extract title",
                    "description": response_text,
                    "key_data_points": [],
                    "trends": [],
                    "comparisons": [],
                    "insights": [],
                    "raw_data": {}
                }
                
        except Exception as e:
            print(f"Error analyzing chart: {e}")
            return {
                "chart_type": "unknown",
                "chart_components": [],
                "title": "Error",
                "description": f"Failed to analyze chart: {str(e)}",
                "key_data_points": [],
                "trends": [],
                "comparisons": [],
                "insights": [],
                "raw_data": {}
            }

    def generate_ielts_writing(self, chart_analysis: Dict[str, Any], task_description: str) -> Dict[str, Any]:
        """
        Tạo bài viết IELTS Writing Task 1 dựa trên phân tích biểu đồ
        """
        try:
            prompt = f"""
            Viết một bài IELTS Writing Task 1 hoàn chỉnh dựa trên thông tin sau:

            Đề bài: {task_description}
            
            Phân tích biểu đồ:
            - Loại biểu đồ: {chart_analysis.get('chart_type', 'unknown')}
            - Components: {chart_analysis.get('chart_components', [])}
            - Tiêu đề: {chart_analysis.get('title', 'N/A')}
            - Mô tả: {chart_analysis.get('description', 'N/A')}
            - Điểm dữ liệu chính: {chart_analysis.get('key_data_points', [])}
            - Xu hướng: {chart_analysis.get('trends', [])}
            - So sánh: {chart_analysis.get('comparisons', [])}
            - Insights: {chart_analysis.get('insights', [])}

            QUAN TRỌNG - Hướng dẫn viết cho MULTI-CHART:
            1. INTRODUCTION: Paraphrase đề bài và mô tả TẤT CẢ các biểu đồ có trong hình
            2. OVERVIEW: Tóm tắt 2-3 xu hướng chính từ TẤT CẢ biểu đồ
            3. BODY PARAGRAPH 1: Mô tả chi tiết biểu đồ đầu tiên với số liệu cụ thể
            4. BODY PARAGRAPH 2: Mô tả chi tiết biểu đồ thứ hai và kết nối với biểu đồ đầu

            Hãy viết bài theo cấu trúc IELTS Writing Task 1 chuẩn và trả về JSON format:
            {{
                "introduction": "Câu mở đầu paraphrase đề bài và mô tả TẤT CẢ biểu đồ",
                "overview": "Đoạn tổng quan nêu 2-3 đặc điểm nổi bật nhất từ TẤT CẢ biểu đồ",
                "body_paragraphs": ["Đoạn chi tiết về biểu đồ 1", "Đoạn chi tiết về biểu đồ 2 và so sánh"],
                "full_essay": "Toàn bộ bài viết",
                "word_count": số_từ_ước_tính
            }}

            Yêu cầu viết bài:
            - Độ dài: 160-200 từ (nhiều hơn vì có nhiều chart)
            - Từ vựng academic: utilize, demonstrate, illustrate, significant, substantial
            - Linking words: while, whereas, in contrast, similarly, furthermore
            - Số liệu cụ thể: dẫn chứng chính xác từ biểu đồ
            - Cấu trúc complex sentences
            - Kết nối logic giữa các biểu đồ
            - Không opinion, chỉ report data

            Mẫu câu hay cho multi-chart:
            - "The first chart illustrates... while the second chart demonstrates..."
            - "Turning to the bar chart, it can be seen that..."
            - "Comparing the data from both charts reveals that..."
            """

            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Extract JSON from response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                result = json.loads(json_str)
                
                # Ensure word_count is integer
                if 'word_count' in result:
                    try:
                        result['word_count'] = int(result['word_count'])
                    except:
                        result['word_count'] = len(result.get('full_essay', '').split())
                
                return result
            else:
                # Fallback
                word_count = len(response_text.split())
                return {
                    "introduction": "Unable to extract structured response",
                    "overview": "",
                    "body_paragraphs": [response_text],
                    "full_essay": response_text,
                    "word_count": word_count
                }
                
        except Exception as e:
            print(f"Error generating IELTS writing: {e}")
            return {
                "introduction": "Error generating response",
                "overview": "",
                "body_paragraphs": [f"Failed to generate IELTS writing: {str(e)}"],
                "full_essay": f"Error: {str(e)}",
                "word_count": 0
            } 