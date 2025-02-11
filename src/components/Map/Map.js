import React from "react";
import { MapContainer, TileLayer, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Typography, Paper, Alert } from "@mui/material";

const Map = ({ tripRoutes }) => {
  const defaultPosition = [40.7128, -74.006]; // New York City coordinates

  return (
    <Box sx={{ height: "600px", width: "100%", position: "relative" }}>
      <Typography
        variant="h6"
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "4px 8px",
          borderRadius: 1,
        }}
      >
        Trip Routes
      </Typography>

      {/* Map Legend */}
      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 1000,
          padding: 2,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          minWidth: 160,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Legend
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 4,
              backgroundColor: "rgb(76, 175, 80)",
              mr: 1,
            }}
          />
          <Typography variant="body2">Pickup Location</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 4,
              backgroundColor: "rgb(211, 47, 47)",
              mr: 1,
            }}
          />
          <Typography variant="body2">Dropoff Location</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 20,
              height: 4,
              backgroundColor: "#1976d2",
              mr: 1,
            }}
          />
          <Typography variant="body2">Trip Route</Typography>
        </Box>
      </Paper>

      {/* No Data Message */}
      {(!tripRoutes || tripRoutes.length === 0) && (
        <Alert
          severity="info"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            minWidth: 300,
            textAlign: "center",
          }}
        >
          No trip data available for the selected filters. Try adjusting your
          search criteria.
        </Alert>
      )}

      <MapContainer
        center={defaultPosition}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {tripRoutes &&
          tripRoutes.map((route, index) => (
            <React.Fragment key={index}>
              {/* Pickup to Dropoff line */}
              <Polyline
                positions={[
                  [route.pickup_latitude, route.pickup_longitude],
                  [route.dropoff_latitude, route.dropoff_longitude],
                ]}
                pathOptions={{
                  color: "#1976d2",
                  weight: 2,
                  opacity: 0.8,
                }}
              >
                <Popup>
                  <Typography variant="body2">
                    <strong>Trip Details</strong>
                    <br />
                    Distance: {route.trip_distance} miles
                    <br />
                    Fare: ${route.fare_amount}
                    <br />
                    Time: {new Date(route.pickup_datetime).toLocaleString()}
                    <br />
                    Payment: {route.payment_type}
                  </Typography>
                </Popup>
              </Polyline>

              {/* Pickup point marker */}
              <Polyline
                positions={[
                  [route.pickup_latitude, route.pickup_longitude],
                  [route.pickup_latitude, route.pickup_longitude],
                ]}
                pathOptions={{
                  color: "rgb(76, 175, 80)",
                  weight: 6,
                  opacity: 0.8,
                }}
              />

              {/* Dropoff point marker */}
              <Polyline
                positions={[
                  [route.dropoff_latitude, route.dropoff_longitude],
                  [route.dropoff_latitude, route.dropoff_longitude],
                ]}
                pathOptions={{
                  color: "rgb(211, 47, 47)",
                  weight: 6,
                  opacity: 0.8,
                }}
              />
            </React.Fragment>
          ))}
      </MapContainer>
    </Box>
  );
};

export default Map;
