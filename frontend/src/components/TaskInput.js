import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import {
  CloudUpload,
  PlayArrow,
  Refresh,
  Delete,
  Image as ImageIcon,
  Description,
} from "@mui/icons-material";
import { validateImageFile } from "../services/api";

const TaskInput = ({
  taskDescription,
  setTaskDescription,
  chartImage,
  setChartImage,
  onAnalyze,
  onReset,
  isLoading,
}) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        try {
          validateImageFile(file);
          setChartImage(file);
        } catch (error) {
          alert(error.message);
        }
      }
    },
    [setChartImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isLoading,
  });

  const removeImage = () => {
    setChartImage(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Task Description Input */}
      <Card elevation={0} sx={{ mb: 3, border: "1px solid #e3f2fd" }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Description color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" color="primary">
              Task Description
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Nhập mô tả IELTS Writing Task 1 của bạn ở đây...
Ví dụ: The chart shows the percentage of people using different types of social media platforms from 2010 to 2020..."
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255,255,255,0.8)",
              },
            }}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            💡 Hãy mô tả chi tiết về loại biểu đồ và thông tin cần phân tích
          </Typography>
        </CardContent>
      </Card>

      {/* Chart Image Upload */}
      <Card elevation={0} sx={{ mb: 3, border: "1px solid #e3f2fd" }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <ImageIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" color="primary">
              Chart Upload
            </Typography>
          </Box>

          {!chartImage ? (
            <Box
              {...getRootProps()}
              className={`dropzone ${isDragActive ? "active" : ""}`}
              sx={{
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: isDragActive
                  ? "2px dashed #1976d2"
                  : "2px dashed #90caf9",
                borderRadius: 2,
                backgroundColor: isDragActive
                  ? "rgba(25, 118, 210, 0.08)"
                  : "rgba(25, 118, 210, 0.04)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                  borderColor: "#1976d2",
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload
                sx={{
                  fontSize: 48,
                  color: isDragActive ? "primary.main" : "primary.light",
                  mb: 2,
                }}
              />
              <Typography variant="h6" color="primary" gutterBottom>
                {isDragActive
                  ? "Thả file ở đây..."
                  : "Kéo thả hoặc click để upload"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center" }}
              >
                Hỗ trợ: JPG, PNG, GIF, WebP
                <br />
                Tối đa 5MB
              </Typography>
            </Box>
          ) : (
            <Card
              variant="outlined"
              sx={{ bgcolor: "rgba(76, 175, 80, 0.05)" }}
            >
              <CardContent>
                {/* Image Preview */}
                <Box sx={{ mb: 2 }}>
                  <img
                    src={URL.createObjectURL(chartImage)}
                    alt="Chart preview"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      backgroundColor: "#fafafa",
                    }}
                  />
                </Box>

                {/* File Info */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center">
                    <ImageIcon color="success" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" color="success.main">
                        {chartImage.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(chartImage.size)}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={removeImage}
                    color="error"
                    size="small"
                    disabled={isLoading}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              📊 Upload biểu đồ cần phân tích (bar chart, line chart, pie chart,
              v.v.)
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card elevation={0} sx={{ border: "1px solid #e3f2fd" }}>
        <CardActions sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={onAnalyze}
              disabled={!taskDescription.trim() || !chartImage || isLoading}
              sx={{
                py: 1.5,
                background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                },
              }}
            >
              {isLoading ? "Đang phân tích..." : "Bắt đầu phân tích"}
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Refresh />}
              onClick={onReset}
              disabled={isLoading}
              sx={{ py: 1.5, minWidth: 120 }}
            >
              Reset
            </Button>
          </Stack>
        </CardActions>
      </Card>
    </Box>
  );
};

export default TaskInput;
