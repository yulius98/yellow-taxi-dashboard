import React from "react";
import {
  Box,
  Slider,
  TextField,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Paper,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  "& .MuiTypography-root": {
    marginBottom: theme.spacing(1),
  },
}));

const MIN_DATE = "2014-01-01T00:00:00.000";
const MAX_DATE = "2014-12-31T23:59:59.000";

const Filters = ({ filters, onFilterChange }) => {
  const handleTimeChange = (event) => {
    const selectedDate = event.target.value;
    // Format the date to include milliseconds
    const formattedDate = new Date(selectedDate);
    if (isNaN(formattedDate.getTime())) {
      return; // Invalid date
    }

    const pad = (num) => String(num).padStart(2, "0");
    const formattedDateTime = `${formattedDate.getFullYear()}-${pad(
      formattedDate.getMonth() + 1
    )}-${pad(formattedDate.getDate())}T${pad(formattedDate.getHours())}:${pad(
      formattedDate.getMinutes()
    )}:${pad(formattedDate.getSeconds())}.000`;

    // Ensure date is within 2014
    if (formattedDateTime < MIN_DATE) {
      onFilterChange("time", MIN_DATE);
    } else if (formattedDateTime > MAX_DATE) {
      onFilterChange("time", MAX_DATE);
    } else {
      onFilterChange("time", formattedDateTime);
    }
  };

  const handleFareChange = (event, newValue) => {
    onFilterChange("fare", newValue);
  };

  const handleDistanceChange = (event, newValue) => {
    onFilterChange("distance", newValue);
  };

  const handlePaymentTypeChange = (event) => {
    onFilterChange("paymentType", event.target.value);
  };

  // Format the display date (without milliseconds for the input)
  const displayDate = filters.time.split(".")[0];

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom color="primary">
        Filter Options
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <FilterSection>
        <Typography variant="subtitle2" color="textSecondary">
          Select Date & Time (2014 only)
        </Typography>
        <TextField
          type="datetime-local"
          value={displayDate}
          onChange={handleTimeChange}
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: MIN_DATE.split(".")[0],
            max: MAX_DATE.split(".")[0],
          }}
        />
      </FilterSection>

      <FilterSection>
        <Typography variant="subtitle2" color="textSecondary">
          Fare Range ($)
        </Typography>
        <Slider
          value={filters.fare}
          onChange={handleFareChange}
          valueLabelDisplay="auto"
          min={0}
          max={100}
          step={5}
          marks={[
            { value: 0, label: "$0" },
            { value: 50, label: "$50" },
            { value: 100, label: "$100" },
          ]}
        />
      </FilterSection>

      <FilterSection>
        <Typography variant="subtitle2" color="textSecondary">
          Trip Distance (miles)
        </Typography>
        <Slider
          value={filters.distance}
          onChange={handleDistanceChange}
          valueLabelDisplay="auto"
          min={0}
          max={30}
          step={1}
          marks={[
            { value: 0, label: "0" },
            { value: 15, label: "15" },
            { value: 30, label: "30" },
          ]}
        />
      </FilterSection>

      <FilterSection sx={{ mb: 0 }}>
        <Typography variant="subtitle2" color="textSecondary">
          Payment Method
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={filters.paymentType}
            onChange={handlePaymentTypeChange}
            displayEmpty
          >
            <MenuItem value="all">All Methods</MenuItem>
            <MenuItem value="CSH">Cash Only</MenuItem>
            <MenuItem value="CRD">Card Only</MenuItem>
          </Select>
        </FormControl>
      </FilterSection>
    </Paper>
  );
};

export default Filters;
