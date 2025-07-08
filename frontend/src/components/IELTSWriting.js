import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Paper,
  Grid,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ContentCopy,
  Download,
  Edit,
  Assessment,
  Timer,
  TextFields,
  CheckCircle,
} from "@mui/icons-material";

const IELTSWriting = ({ analysisResult }) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  if (!analysisResult) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(76, 175, 80, 0.05)",
          borderRadius: 2,
          border: "1px dashed #4caf50",
          minHeight: 300,
        }}
      >
        <Box textAlign="center">
          <Edit sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
          <Typography variant="h6" color="success.main" gutterBottom>
            Chưa có bài viết IELTS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phân tích biểu đồ để tạo ra bài viết mẫu
          </Typography>
        </Box>
      </Box>
    );
  }

  const { ielts_writing, processing_time } = analysisResult.data || {};

  if (!ielts_writing) {
    return <Alert severity="warning">Không có dữ liệu bài viết IELTS</Alert>;
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(ielts_writing.full_essay);
      setCopiedToClipboard(true);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([ielts_writing.full_essay], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ielts-writing-task1.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score) => {
    if (score >= 7) return "success";
    if (score >= 6) return "info";
    if (score >= 5) return "warning";
    return "error";
  };

  const formatWordCount = (count) => {
    if (count >= 150) return { color: "success.main", status: "Good" };
    if (count >= 120) return { color: "warning.main", status: "Fair" };
    return { color: "error.main", status: "Too Short" };
  };

  const wordCountInfo = formatWordCount(ielts_writing.word_count || 0);

  return (
    <Box sx={{ overflow: "auto" }}>
      {/* Writing Stats */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          bgcolor: "rgba(76, 175, 80, 0.05)",
          border: "1px solid #c8e6c9",
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Assessment color="success" />
            <Typography variant="h6" sx={{ ml: 1, color: "success.main" }}>
              Writing Statistics
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography
                  variant="h4"
                  sx={{ color: wordCountInfo.color, fontWeight: "bold" }}
                >
                  {ielts_writing.word_count || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Words
                </Typography>
                <Chip
                  label={wordCountInfo.status}
                  size="small"
                  color={
                    wordCountInfo.color === "success.main"
                      ? "success"
                      : wordCountInfo.color === "warning.main"
                      ? "warning"
                      : "error"
                  }
                  sx={{ display: "block", mt: 0.5 }}
                />
              </Box>
            </Grid>

            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {ielts_writing.estimated_band || "N/A"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Est. Band
                </Typography>
                <Chip
                  label="IELTS Score"
                  size="small"
                  color={getScoreColor(ielts_writing.estimated_band)}
                  sx={{ display: "block", mt: 0.5 }}
                />
              </Box>
            </Grid>

            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {processing_time ? `${processing_time.toFixed(1)}s` : "N/A"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Generation
                </Typography>
                <Chip
                  label="AI Speed"
                  size="small"
                  color="info"
                  sx={{ display: "block", mt: 0.5 }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Essay Structure */}
      {(ielts_writing.introduction ||
        ielts_writing.overview ||
        ielts_writing.body_paragraphs) && (
        <Card elevation={0} sx={{ mb: 3, border: "1px solid #c8e6c9" }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <TextFields color="info" />
              <Typography variant="h6" sx={{ ml: 1, color: "info.main" }}>
                Essay Structure
              </Typography>
            </Box>

            {/* Introduction */}
            {ielts_writing.introduction && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Introduction
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "rgba(25, 118, 210, 0.04)",
                    border: "1px solid rgba(25, 118, 210, 0.12)",
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {ielts_writing.introduction}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Overview */}
            {ielts_writing.overview && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Overview
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "rgba(25, 118, 210, 0.04)",
                    border: "1px solid rgba(25, 118, 210, 0.12)",
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {ielts_writing.overview}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Body Paragraphs */}
            {ielts_writing.body_paragraphs &&
              ielts_writing.body_paragraphs.map((paragraph, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Body Paragraph {index + 1}
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "rgba(25, 118, 210, 0.04)",
                      border: "1px solid rgba(25, 118, 210, 0.12)",
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {paragraph}
                    </Typography>
                  </Paper>
                </Box>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={copiedToClipboard}
        autoHideDuration={3000}
        onClose={() => setCopiedToClipboard(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setCopiedToClipboard(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          📋 Essay copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IELTSWriting;
