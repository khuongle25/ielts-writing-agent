import React, { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  AppBar,
  Toolbar,
  LinearProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { Assessment, Edit, CloudUpload } from "@mui/icons-material";

// Import components
import TaskInput from "./components/TaskInput";
import ChartAnalysis from "./components/ChartAnalysis";
import IELTSWriting from "./components/IELTSWriting";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";

// Import API service
import { analyzeChart } from "./services/api";

// Custom MUI Theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#f50057",
      light: "#ff5983",
      dark: "#c51162",
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
    success: {
      main: "#4caf50",
    },
    warning: {
      main: "#ff9800",
    },
  },
  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h4: {
      fontWeight: 600,
      color: "#1565c0",
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [taskDescription, setTaskDescription] = useState("");
  const [chartImage, setChartImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAnalyze = async () => {
    if (!taskDescription.trim() || !chartImage) {
      setError("Vui lòng nhập mô tả task và upload ảnh biểu đồ");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      const formData = new FormData();
      formData.append("task_description", taskDescription);
      formData.append("chart_image", chartImage);

      const result = await analyzeChart(formData);

      clearInterval(progressInterval);
      setProgress(100);

      setAnalysisResult(result);
      setShowSuccess(true);

      setTimeout(() => {
        setProgress(0);
      }, 1000);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi phân tích");
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTaskDescription("");
    setChartImage(null);
    setAnalysisResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Assessment sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎯 IELTS Writing Task 1 - Chart Analysis Tool
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            AI-Powered Analysis & Writing Assistant
          </Typography>
        </Toolbar>
        {isLoading && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 3 }}
          />
        )}
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Three Column Layout */}
        <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
          {/* Column 1: Task Input */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
                border: "1px solid #e1f5fe",
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <CloudUpload color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">
                  Task Input & Chart Upload
                </Typography>
              </Box>

              <TaskInput
                taskDescription={taskDescription}
                setTaskDescription={setTaskDescription}
                chartImage={chartImage}
                setChartImage={setChartImage}
                onAnalyze={handleAnalyze}
                onReset={handleReset}
                isLoading={isLoading}
              />
            </Paper>
          </Grid>

          {/* Column 2: Chart Analysis */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)",
                border: "1px solid #ffe0b2",
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <Assessment color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="secondary">
                  Chart Analysis Results
                </Typography>
              </Box>

              {isLoading ? (
                <LoadingSpinner message="Đang phân tích biểu đồ..." />
              ) : (
                <ChartAnalysis analysisResult={analysisResult} />
              )}
            </Paper>
          </Grid>

          {/* Column 3: IELTS Writing */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)",
                border: "1px solid #c8e6c9",
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <Edit color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  Generated IELTS Essay
                </Typography>
              </Box>

              {isLoading ? (
                <LoadingSpinner message="Đang tạo bài viết..." />
              ) : (
                <IELTSWriting analysisResult={analysisResult} />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          variant="filled"
        >
          🎉 Phân tích thành công! Kết quả đã được tạo.
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
