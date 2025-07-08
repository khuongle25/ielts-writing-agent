import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Paper,
  Grid,
  Alert,
} from "@mui/material";
import {
  TrendingUp,
  DataUsage,
  Insights,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  DonutLarge,
} from "@mui/icons-material";

const ChartAnalysis = ({ analysisResult }) => {
  if (!analysisResult) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(255, 152, 0, 0.05)",
          borderRadius: 2,
          border: "1px dashed #ff9800",
          minHeight: 300,
        }}
      >
        <Box textAlign="center">
          <Insights sx={{ fontSize: 60, color: "warning.main", mb: 2 }} />
          <Typography variant="h6" color="warning.main" gutterBottom>
            Chưa có kết quả phân tích
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng upload biểu đồ và bắt đầu phân tích để xem kết quả
          </Typography>
        </Box>
      </Box>
    );
  }

  const { chart_analysis } = analysisResult.data || {};

  if (!chart_analysis) {
    return <Alert severity="warning">Không có dữ liệu phân tích biểu đồ</Alert>;
  }

  const getChartIcon = (chartType) => {
    switch (chartType?.toLowerCase()) {
      case "bar_chart":
      case "bar":
        return <BarChart />;
      case "line_chart":
      case "line":
        return <ShowChart />;
      case "pie_chart":
      case "pie":
        return <PieChart />;
      case "donut_chart":
      case "donut":
        return <DonutLarge />;
      default:
        return <DataUsage />;
    }
  };

  const formatChartType = (chartType) => {
    return (
      chartType?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Unknown"
    );
  };

  return (
    <Box sx={{ overflow: "auto" }}>
      {/* Chart Type & Overview */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          bgcolor: "rgba(255, 152, 0, 0.05)",
          border: "1px solid #ffcc02",
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            {getChartIcon(chart_analysis.chart_type)}
            <Typography variant="h6" sx={{ ml: 1, color: "warning.main" }}>
              Chart Type Detected
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Chip
              label={formatChartType(chart_analysis.chart_type)}
              color="warning"
              variant="filled"
              sx={{
                fontSize: "0.9rem",
                fontWeight: 600,
                px: 2,
                mr: 1,
              }}
            />

            {/* Chart Components */}
            {chart_analysis.chart_components &&
              chart_analysis.chart_components.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    📊 Chart Components:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {chart_analysis.chart_components.map((component, index) => (
                      <Chip
                        key={index}
                        label={formatChartType(component)}
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
          </Box>

          {chart_analysis.description && (
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              {chart_analysis.description}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Key Data Points */}
      <Card elevation={0} sx={{ mb: 3, border: "1px solid #ffcc02" }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <TrendingUp color="secondary" />
            <Typography variant="h6" sx={{ ml: 1, color: "secondary.main" }}>
              Key Data Points
            </Typography>
          </Box>

          {chart_analysis.key_data_points &&
          chart_analysis.key_data_points.length > 0 ? (
            <List dense>
              {chart_analysis.key_data_points.map((point, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: "secondary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                      }}
                    >
                      {index + 1}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={point}
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { lineHeight: 1.4 },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              fontStyle="italic"
            >
              Không có data points được phát hiện
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Trends */}
      {chart_analysis.trends && chart_analysis.trends.length > 0 && (
        <Card elevation={0} sx={{ mb: 3, border: "1px solid #ffcc02" }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Timeline color="info" />
              <Typography variant="h6" sx={{ ml: 1, color: "info.main" }}>
                Trends Analysis
              </Typography>
            </Box>

            <List dense>
              {chart_analysis.trends.map((trend, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TrendingUp color="info" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={trend}
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { lineHeight: 1.4 },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Additional Insights */}
      {chart_analysis.insights && chart_analysis.insights.length > 0 && (
        <Card elevation={0} sx={{ mb: 3, border: "1px solid #ffcc02" }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Insights color="success" />
              <Typography variant="h6" sx={{ ml: 1, color: "success.main" }}>
                AI Insights
              </Typography>
            </Box>

            <List dense>
              {chart_analysis.insights.map((insight, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "success.main",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={insight}
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { lineHeight: 1.4 },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: "rgba(255, 152, 0, 0.08)",
          border: "1px solid #ffcc02",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {chart_analysis.key_data_points?.length || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Data Points
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {chart_analysis.trends?.length || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Trends Found
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ChartAnalysis;
