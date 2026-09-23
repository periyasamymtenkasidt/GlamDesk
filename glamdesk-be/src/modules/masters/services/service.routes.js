const express = require("express");
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  toggleServiceStatus,
  deleteService,
  getCategories,
  createCategory,
  deleteCategory,
} = require("./service.controller");

// Category Routes (Specific routes first before :id param)
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);

// Service Routes
router.get("/", getServices);
router.get("/:id", getServiceById);
router.post("/", createService);
router.put("/:id", updateService);
router.patch("/:id/status", toggleServiceStatus);
router.delete("/:id", deleteService);

module.exports = router;
