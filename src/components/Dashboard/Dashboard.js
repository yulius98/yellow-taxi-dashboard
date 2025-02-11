import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Paper,
  CircularProgress,
  Box,
  Alert,
  Typography,
  Divider,
  AlertTitle,
  Fade,
} from "@mui/material";
import Map from "../Map/Map";
import Filters from "../Filters/Filters";
import Charts from "../Charts/Charts";
import axios from "axios";

const DEFAULT_DATE = "2014-01-15T09:00:00.000"; // Wednesday morning, likely to have taxi data
const API_TIMEOUT = 30000;
const MAX_DISPLAY_TRIPS = 500;
const TIME_WINDOW_HOURS = 2; // Hours before and after the selected time

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [filters, setFilters] = useState({
    time: DEFAULT_DATE,
    fare: [0, 100],
    distance: [0, 30],
    paymentType: "all",
  });

  // Helper function to format date for API query
  const formatDateForQuery = (dateString) => {
    const date = new Date(dateString);

    // Create start and end times (2 hours before and after)
    const startTime = new Date(
      date.getTime() - TIME_WINDOW_HOURS * 60 * 60 * 1000
    );
    const endTime = new Date(
      date.getTime() + TIME_WINDOW_HOURS * 60 * 60 * 1000
    );

    // Format dates in YYYY-MM-DDTHH:mm:ss.000 format
    const formatDateTime = (date) => {
      const pad = (num) => String(num).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
        date.getSeconds()
      )}.000`;
    };

    return {
      start: formatDateTime(startTime),
      end: formatDateTime(endTime),
    };
  };

  const fetchTripData = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      setLoading(true);
      setError(null);

      const timeWindow = formatDateForQuery(filters.time);
      const response = await axios.get(
        "https://data.cityofnewyork.us/resource/gkne-dk5s.json",
        {
          params: {
            $where: `pickup_datetime >= '${
              timeWindow.start
            }' AND pickup_datetime <= '${timeWindow.end}' AND fare_amount >= ${
              filters.fare[0]
            } AND fare_amount <= ${filters.fare[1]} AND trip_distance >= ${
              filters.distance[0]
            } AND trip_distance <= ${filters.distance[1]}${
              filters.paymentType !== "all"
                ? ` AND payment_type = '${filters.paymentType}'`
                : ""
            }`,
            $limit: 2000,
            $order: "pickup_datetime",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!Array.isArray(response.data) || response.data.length === 0) {
        setError(
          "No trips found for the selected filters. Try adjusting your search criteria or selecting a different time."
        );
        setTripData(null);
        return;
      }

      const validTrips = response.data
        .map((trip) => {
          try {
            return {
              ...trip,
              pickup_latitude: parseFloat(trip.pickup_latitude),
              pickup_longitude: parseFloat(trip.pickup_longitude),
              dropoff_latitude: parseFloat(trip.dropoff_latitude),
              dropoff_longitude: parseFloat(trip.dropoff_longitude),
              fare_amount: parseFloat(trip.fare_amount),
              trip_distance: parseFloat(trip.trip_distance),
            };
          } catch (error) {
            console.warn("Error parsing trip data:", error);
            return null;
          }
        })
        .filter((trip) => trip !== null);

      if (validTrips.length === 0) {
        setError("No valid trip data found in the response");
        setTripData(null);
        return;
      }

      // Randomly sample trips if we have more than MAX_DISPLAY_TRIPS
      const displayTrips =
        validTrips.length > MAX_DISPLAY_TRIPS
          ? validTrips
              .sort(() => 0.5 - Math.random())
              .slice(0, MAX_DISPLAY_TRIPS)
          : validTrips;

      setTripData({
        tripRoutes: displayTrips,
        fareByTime: processAverageFareByTime(validTrips),
        distanceDistribution: processDistanceDistribution(validTrips),
        paymentDistribution: processPaymentDistribution(validTrips),
        totalTrips: validTrips.length,
        displayedTrips: displayTrips.length,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error fetching trip data:", error);

      if (error.name === "AbortError") {
        setError(
          "Request timed out. The server is taking too long to respond. Please try again."
        );
      } else if (error.response) {
        setError(
          `Server error: ${error.response.status} - ${error.response.statusText}`
        );
      } else if (error.request) {
        setError(
          "Unable to reach the server. Please check your internet connection and try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }

      setTripData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const processAverageFareByTime = (data) => {
    const hourlyFares = Array(6).fill(0);
    const hourlyCount = Array(6).fill(0);

    data.forEach((trip) => {
      const hour = new Date(trip.pickup_datetime).getHours();
      const index = Math.floor(hour / 4);
      if (index >= 0 && index < 6) {
        hourlyFares[index] += trip.fare_amount;
        hourlyCount[index]++;
      }
    });

    return hourlyFares.map((total, index) =>
      hourlyCount[index] ? +(total / hourlyCount[index]).toFixed(2) : 0
    );
  };

  const processDistanceDistribution = (data) => {
    const distribution = [0, 0, 0, 0, 0];
    data.forEach((trip) => {
      const distance = trip.trip_distance;
      if (distance <= 2) distribution[0]++;
      else if (distance <= 5) distribution[1]++;
      else if (distance <= 10) distribution[2]++;
      else if (distance <= 15) distribution[3]++;
      else distribution[4]++;
    });
    return distribution;
  };

  const processPaymentDistribution = (data) => {
    const distribution = [0, 0, 0];
    data.forEach((trip) => {
      switch (trip.payment_type?.toUpperCase()) {
        case "CSH":
          distribution[0]++;
          break;
        case "CRD":
          distribution[1]++;
          break;
        default:
          distribution[2]++;
      }
    });
    return distribution;
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  useEffect(() => {
    fetchTripData();
  }, [fetchTripData]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: 600,
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading trip data...
          </Typography>
        </Box>
      );
    }

    return <Map tripRoutes={tripData?.tripRoutes} />;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          NYC Yellow Taxi Trip Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Explore New York City taxi trip data with interactive visualizations.
          Use the filters to analyze trips by time, fare amount, distance, and
          payment method.
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>About the Data</AlertTitle>
          This dashboard visualizes NYC Yellow Taxi trip data from 2014. Each
          line on the map represents a taxi trip from pickup (green) to dropoff
          (red) location. Click on any trip line to see details about fare,
          distance, and time.
          {tripData && tripData.totalTrips > MAX_DISPLAY_TRIPS && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Note: Showing a random sample of {tripData.displayedTrips} trips
              out of {tripData.totalTrips} total trips for better performance.
            </Typography>
          )}
        </Alert>
        <Divider />
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Typography
              variant="body2"
              component="span"
              sx={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={fetchTripData}
            >
              Try Again
            </Typography>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={3}>
            <Filters filters={filters} onFilterChange={handleFilterChange} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper elevation={3}>
            <Fade in={true} timeout={500}>
              <Box>{renderContent()}</Box>
            </Fade>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3}>
            <Fade in={!loading} timeout={500}>
              <Box>
                <Charts tripData={tripData} loading={loading} error={error} />
                {tripData && !loading && !error && (
                  <Box sx={{ px: 3, pb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      The charts above show the average fare by time of day,
                      distribution of trip distances, and payment methods used.
                      This data helps identify patterns in taxi usage and
                      pricing across New York City.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Fade>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: "divider" }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Data source: NYC Open Data - 2014 Yellow Taxi Trip Data
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;
