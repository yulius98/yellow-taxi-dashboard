# Yellow Taxi Trip Analytics Dashboard

An interactive web application for visualizing and analyzing New York City Yellow Taxi trip data. The dashboard provides insights into taxi trips through map visualization, data filtering, and analytical charts.

## Features

- **Interactive Map Visualization**

  - Display trip routes from pickup to drop-off locations
  - Hover over routes to view trip details
  - Clustered markers for better performance with large datasets

- **Advanced Filtering**

  - Filter trips by time/date
  - Filter by fare amount range
  - Filter by trip distance
  - Filter by payment type

- **Data Analytics**
  - Average fare by time of day
  - Trip distance distribution
  - Payment type distribution
  - Real-time data updates

## Technologies Used

- **Frontend**

  - React.js
  - Material-UI for UI components
  - Leaflet for map visualization
  - Chart.js for data visualization
  - Axios for API requests

- **Data Source**
  - NYC Open Data (2014 Yellow Taxi Trip Data)
  - Socrata Open Data API

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd yellow-taxi-dashboard
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

The application uses the NYC Open Data API to fetch taxi trip data. The endpoint used is:

```
https://data.cityofnewyork.us/resource/gkne-dk5s.json
```

Query parameters:

- `$limit`: Number of records to return
- `$where`: SQL-like query string for filtering data
  - `pickup_datetime`: Filter by pickup time
  - `fare_amount`: Filter by fare amount
  - `trip_distance`: Filter by trip distance
  - `payment_type`: Filter by payment type

## Deployment

To deploy the application:

1. Build the production version:

   ```bash
   npm run build
   ```

2. The build folder can be deployed to any static hosting service (e.g., Vercel, Netlify, GitHub Pages).

## Performance Considerations

- The application implements data pagination and filtering on the server side
- Map markers are clustered for better performance with large datasets
- Optimized chart rendering using memoization
- Efficient state management to prevent unnecessary re-renders

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
