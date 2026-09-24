require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./shared/config/db");
const {
  notFoundHandler,
  errorHandler,
} = require("./shared/middleware/errorHandler");

// Import Masters Feature Modules
const serviceRoutes = require("./modules/masters/services/service.routes");
const venueRoutes = require("./modules/masters/venues/venue.routes");
const vendorRoutes = require("./modules/masters/vendors/vendor.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Core Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    app: "GlamDesk Artist CRM API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── MOUNT MASTERS DOMAIN ROUTES ────────────────────────────────────────────
app.use("/api/masters/services", serviceRoutes);
app.use("/api/masters/venues", venueRoutes);
app.use("/api/masters/vendors", vendorRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `[GlamDesk-BE] Server running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`,
    );
    console.log(`[GlamDesk-BE] Masters API Endpoints:`);
    console.log(`  - Services: http://localhost:${PORT}/api/masters/services`);
    console.log(`  - Venues:   http://localhost:${PORT}/api/masters/venues`);
    console.log(`  - Vendors:  http://localhost:${PORT}/api/masters/vendors`);
  });
}

module.exports = app;
