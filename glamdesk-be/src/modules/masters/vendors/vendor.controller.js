const { Vendor, VendorRole } = require("./vendor.model");
const { successResponse, errorResponse } = require("../../../shared/utils/response");

// ─── VENDORS CRUD ───────────────────────────────────────────────────────────

/**
 * Get all vendors with role filter, search, and active status
 * GET /api/masters/vendors
 */
const getVendors = async (req, res, next) => {
  try {
    const { role, search, activeOnly } = req.query;
    const filter = {};

    if (role && role !== "All") {
      filter.role = role;
    }

    if (activeOnly === "true") {
      filter.isActive = true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const vendors = await Vendor.find(filter).sort({ createdAt: -1 });
    return successResponse(res, vendors, "Vendors retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get single vendor by ID
 * GET /api/masters/vendors/:id
 */
const getVendorById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return errorResponse(res, "Vendor not found", 404);
    }
    return successResponse(res, vendor, "Vendor retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Create new vendor
 * POST /api/masters/vendors
 */
const createVendor = async (req, res, next) => {
  try {
    const {
      name,
      role,
      phone,
      email,
      experience,
      payoutType,
      defaultPayout,
      rating,
      tags,
      address,
      notes,
      bankDetails,
    } = req.body;

    if (!name || !role || !phone) {
      return errorResponse(res, "Vendor name, role, and phone are required", 400);
    }

    const newVendor = await Vendor.create({
      name: name.trim(),
      role: role.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : "",
      experience: experience || "3+ years",
      payoutType: payoutType || "Per Event",
      defaultPayout: defaultPayout ? Number(defaultPayout) : 2000,
      rating: rating ? Number(rating) : 4.8,
      tags: Array.isArray(tags) ? tags : [],
      address: address || "Chennai, Tamil Nadu",
      notes: notes || "",
      bankDetails: bankDetails || {},
      isActive: true,
      availability: [],
    });

    return successResponse(res, newVendor, "Vendor created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update vendor profile
 * PUT /api/masters/vendors/:id
 */
const updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vendor) {
      return errorResponse(res, "Vendor not found", 404);
    }

    return successResponse(res, vendor, "Vendor profile updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle vendor status
 * PATCH /api/masters/vendors/:id/status
 */
const toggleVendorStatus = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return errorResponse(res, "Vendor not found", 404);
    }

    vendor.isActive = !vendor.isActive;
    await vendor.save();

    return successResponse(
      res,
      vendor,
      `Vendor marked as ${vendor.isActive ? "active" : "inactive"}`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete vendor
 * DELETE /api/masters/vendors/:id
 */
const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return errorResponse(res, "Vendor not found", 404);
    }

    return successResponse(res, { id: req.params.id }, "Vendor deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Add / Update vendor availability (Leave / Blackout date)
 * POST /api/masters/vendors/:id/availability
 */
const addAvailabilityRecord = async (req, res, next) => {
  try {
    const { date, status, reason } = req.body;
    if (!date) {
      return errorResponse(res, "Date is required", 400);
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return errorResponse(res, "Vendor not found", 404);
    }

    // Remove existing record for the same date if present
    vendor.availability = vendor.availability.filter((a) => a.date !== date);
    vendor.availability.push({
      date,
      status: status || "Leave",
      reason: reason || "",
    });

    await vendor.save();
    return successResponse(res, vendor.availability, "Availability updated successfully");
  } catch (error) {
    next(error);
  }
};

// ─── VENDOR ROLES CRUD ──────────────────────────────────────────────────────

/**
 * Get all vendor roles
 * GET /api/masters/vendors/roles
 */
const getVendorRoles = async (req, res, next) => {
  try {
    const roles = await VendorRole.find().sort({ createdAt: 1 });
    return successResponse(res, roles, "Vendor roles retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Create vendor role
 * POST /api/masters/vendors/roles
 */
const createVendorRole = async (req, res, next) => {
  try {
    const { name, defaultSuggestions } = req.body;
    if (!name) {
      return errorResponse(res, "Role name is required", 400);
    }

    const role = await VendorRole.create({
      name: name.trim(),
      defaultSuggestions: Array.isArray(defaultSuggestions) ? defaultSuggestions : [],
      isActive: true,
    });

    return successResponse(res, role, "Vendor role created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete vendor role
 * DELETE /api/masters/vendors/roles/:id
 */
const deleteVendorRole = async (req, res, next) => {
  try {
    const role = await VendorRole.findByIdAndDelete(req.params.id);
    if (!role) {
      return errorResponse(res, "Vendor role not found", 404);
    }
    return successResponse(res, { id: req.params.id }, "Vendor role deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  toggleVendorStatus,
  deleteVendor,
  addAvailabilityRecord,
  getVendorRoles,
  createVendorRole,
  deleteVendorRole,
};
