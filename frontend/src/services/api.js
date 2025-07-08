import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for AI processing
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 Making ${config.method?.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const ieltsAPI = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  },

  // Analyze IELTS task with form data (multipart)
  analyzeTask: async (taskDescription, imageFile, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append("task_description", taskDescription);
      formData.append("chart_image", imageFile);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      // Add progress callback if provided
      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        };
      }

      const response = await api.post("/analyze", formData, config);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(`Analysis failed: ${errorMessage}`);
    }
  },

  // Analyze with JSON payload (alternative method)
  analyzeTaskJSON: async (taskDescription, imageBase64) => {
    try {
      const payload = {
        task_description: taskDescription,
        image_base64: imageBase64,
      };

      const response = await api.post("/analyze-json", payload);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(`JSON analysis failed: ${errorMessage}`);
    }
  },

  // Get workflow information
  getWorkflowInfo: async () => {
    try {
      const response = await api.get("/workflow-info");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get workflow info: ${error.message}`);
    }
  },
};

// Utility function to convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data:image/jpeg;base64, prefix
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Utility function to validate image file
export const validateImageFile = (file) => {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const maxSizeMB = 10; // 10MB limit

  if (!validTypes.includes(file.type)) {
    throw new Error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }

  return true;
};

// Modern function for MUI components
export const analyzeChart = async (formData) => {
  try {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await api.post("/analyze", formData, config);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message;
    throw new Error(`Analysis failed: ${errorMessage}`);
  }
};

export default api;
