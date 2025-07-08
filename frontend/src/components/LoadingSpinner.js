import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
  Card,
  CardContent,
} from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";

const LoadingSpinner = ({ message = "Đang xử lý...", progress }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
      }}
    >
      <Card
        elevation={0}
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: "rgba(25, 118, 210, 0.05)",
          border: "1px solid rgba(25, 118, 210, 0.12)",
          minWidth: 250,
        }}
      >
        <CardContent>
          {/* Loading Icon */}
          <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: "primary.main",
                "& .MuiCircularProgress-circle": {
                  strokeLinecap: "round",
                },
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoAwesome
                sx={{
                  color: "primary.main",
                  fontSize: 24,
                  animation: "pulse 2s infinite",
                }}
              />
            </Box>
          </Box>

          {/* Loading Message */}
          <Typography
            variant="h6"
            color="primary"
            gutterBottom
            sx={{ fontWeight: 500 }}
          >
            {message}
          </Typography>

          {/* Progress Dots Animation */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  mx: 0.5,
                  animation: `bounce 1.4s infinite ease-in-out`,
                  animationDelay: `${index * 0.2}s`,
                  "@keyframes bounce": {
                    "0%, 80%, 100%": {
                      transform: "scale(0)",
                      opacity: 0.5,
                    },
                    "40%": {
                      transform: "scale(1)",
                      opacity: 1,
                    },
                  },
                }}
              />
            ))}
          </Box>

          {/* Progress Bar (if progress is provided) */}
          {typeof progress === "number" && (
            <Box sx={{ width: "100%", mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {Math.round(progress)}% hoàn thành
              </Typography>
            </Box>
          )}

          {/* Loading Steps */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            🤖 AI đang làm việc để tạo ra kết quả tốt nhất
          </Typography>
        </CardContent>
      </Card>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};

export default LoadingSpinner;
