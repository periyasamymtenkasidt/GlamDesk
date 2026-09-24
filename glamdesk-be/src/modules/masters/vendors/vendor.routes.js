const express = require("express");
const router = express.Router();
const {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  toggleVendorStatus,
  deleteVendor,
  addAvailabilityRecord,
  getVendorRoles,
  createVendorRole,
  updateVendorRole,
  deleteVendorRole,
} = require("./vendor.controller");

// Vendor Roles Routes (Before :id param)
router.get("/roles", getVendorRoles);
router.post("/roles", createVendorRole);
router.put("/roles/:id", updateVendorRole);
router.delete("/roles/:id", deleteVendorRole);

// Vendor Routes
router.get("/", getVendors);
router.get("/:id", getVendorById);
router.post("/", createVendor);
router.put("/:id", updateVendor);
router.patch("/:id/status", toggleVendorStatus);
router.delete("/:id", deleteVendor);
router.post("/:id/availability", addAvailabilityRecord);

module.exports = router;
