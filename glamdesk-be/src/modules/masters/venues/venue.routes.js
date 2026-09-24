const express = require("express");
const router = express.Router();
const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  toggleVenueStatus,
  deleteVenue,
  getVenueTypes,
  createVenueType,
  updateVenueType,
  deleteVenueType,
} = require("./venue.controller");

// Venue Type Routes (Before :id param)
router.get("/types", getVenueTypes);
router.post("/types", createVenueType);
router.put("/types/:id", updateVenueType);
router.delete("/types/:id", deleteVenueType);

// Venue Routes
router.get("/", getVenues);
router.get("/:id", getVenueById);
router.post("/", createVenue);
router.put("/:id", updateVenue);
router.patch("/:id/status", toggleVenueStatus);
router.delete("/:id", deleteVenue);

module.exports = router;
