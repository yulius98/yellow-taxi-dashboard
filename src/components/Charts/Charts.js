import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Skeleton,
  Alert,
  Fade,
} from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartSkeleton = () => (
  <Box sx={{ position: "relative" }}>
    <Skeleton
      variant="rectangular"
      width="100%"
      height={250}
      sx={{ borderRadius: 1 }}
    />
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Loading chart data...
      </Typography>
    </Box>
  </Box>
);

const NoDataMessage = () => (
  <Box
    sx={{
      height: 250,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Typography variant="body2" color="text.secondary">
      No data available for the selected filters
    </Typography>
  </Box>
);

const Charts = ({ tripData, loading, error }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#000",
        bodyColor: "#666",
        borderColor: "#ddd",
        borderWidth: 1,
        padding: 10,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Average fare by time of day
  const fareByTimeData = {
    labels: ["12am", "4am", "8am", "12pm", "4pm", "8pm"],
    datasets: [
      {
        label: "Average Fare ($)",
        data: tripData?.fareByTime || [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.3,
        pointStyle: "circle",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Trip distance distribution
  const distanceData = {
    labels: ["0-2", "2-5", "5-10", "10-15", "15+"],
    datasets: [
      {
        label: "Number of Trips",
        data: tripData?.distanceDistribution || [],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Payment type distribution
  const paymentData = {
    labels: ["Cash", "Card", "Other"],
    datasets: [
      {
        data: tripData?.paymentDistribution || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 206, 86)",
        ],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const renderChart = (title, ChartComponent, data, customOptions = {}) => (
    <Paper sx={{ p: 2, height: 350 }}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      <Fade in={!loading} timeout={500}>
        <Box sx={{ height: "calc(100% - 32px)" }}>
          {loading ? (
            <ChartSkeleton />
          ) : error ? (
            <NoDataMessage />
          ) : (
            <ChartComponent
              data={data}
              options={{ ...chartOptions, ...customOptions }}
            />
          )}
        </Box>
      </Fade>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Trip Analytics
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {renderChart("Average Fare by Time of Day", Line, fareByTimeData)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart("Trip Distance Distribution", Bar, distanceData)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart("Payment Type Distribution", Pie, paymentData, {
            plugins: {
              ...chartOptions.plugins,
              legend: {
                ...chartOptions.plugins.legend,
                position: "right",
              },
            },
          })}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Charts;
