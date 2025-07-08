import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Error,
  Refresh,
  ExpandMore,
  ExpandLess,
  BugReport,
} from "@mui/icons-material";

const ErrorMessage = ({ message, onDismiss, onRetry, details }) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Alert
        severity="error"
        onClose={onDismiss}
        action={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {details && (
              <IconButton
                aria-label="expand"
                size="small"
                onClick={handleExpandClick}
                sx={{ mr: 1 }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
            {onRetry && (
              <Button
                color="inherit"
                size="small"
                startIcon={<Refresh />}
                onClick={onRetry}
                sx={{ ml: 1 }}
              >
                Retry
              </Button>
            )}
          </Box>
        }
        sx={{
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
      >
        <AlertTitle sx={{ display: "flex", alignItems: "center" }}>
          <Error sx={{ mr: 1 }} />
          Có lỗi xảy ra
        </AlertTitle>

        <Typography variant="body2" sx={{ mb: details ? 1 : 0 }}>
          {message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại."}
        </Typography>

        {details && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "rgba(211, 47, 47, 0.05)",
                border: "1px solid rgba(211, 47, 47, 0.12)",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                  fontWeight: 600,
                  color: "error.dark",
                }}
              >
                <BugReport sx={{ fontSize: 16, mr: 0.5 }} />
                Technical Details
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  whiteSpace: "pre-wrap",
                  color: "error.dark",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  p: 1,
                  borderRadius: 0.5,
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                {details}
              </Typography>
            </Box>
          </Collapse>
        )}

        {/* Error Tips */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            💡 <strong>Gợi ý:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2, mb: 0 }}>
            <Typography
              component="li"
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.875rem" }}
            >
              Kiểm tra kết nối internet
            </Typography>
            <Typography
              component="li"
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.875rem" }}
            >
              Đảm bảo file ảnh hợp lệ (JPG, PNG, GIF)
            </Typography>
            <Typography
              component="li"
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.875rem" }}
            >
              Thử lại sau vài giây
            </Typography>
          </Box>
        </Box>
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
