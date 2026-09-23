const { Venue, VenueType } = require("./venue.model");
const { successResponse, errorResponse } = require("../../../shared/utils/response");

// ─── VENUES CRUD ────────────────────────────────────────────────────────────

/**
 * Get all venues with optional type filter and search
 * GET /api/masters/venues
 */
const getVenues = async (req, res, next) => {
  try {
    const { venueType, search, activeOnly } = req.query;
    const filter = {};

    if (venueType && venueType !== "All") {
      filter.venueType = venueType;
    }

    if (activeOnly === "true") {
      filter.isActive = true;
    }

    if (search) {
      filter.$or = [
        { venueName: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const venues = await Venue.find(filter).sort({ createdAt: -1 });
    return successResponse(res, venues, "Venues retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get single venue by ID
 * GET /api/masters/venues/:id
 */
const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return errorResponse(res, "Venue not found", 404);
    }
    return successResponse(res, venue, "Venue retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Create venue
 * POST /api/masters/venues
 */
const createVenue = async (req, res, next) => {
  try {
    const { venueName, venueType, description, travelSurcharge, priceDelta, deltaType, address, city } = req.body;

    if (!venueName || !venueType) {
      return errorResponse(res, "Venue name and venue type are required", 400);
    }

    const newVenue = await Venue.create({
      venueName: venueName.trim(),
      venueType: venueType.trim(),
      description: description || "",
      travelSurcharge: travelSurcharge ? Number(travelSurcharge) : 0,
      priceDelta: priceDelta ? Number(priceDelta) : 0,
      deltaType: deltaType || "premium",
      address: address || "",
      city: city || "Chennai",
      isActive: true,
    });

    return successResponse(res, newVenue, "Venue created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update venue
 * PUT /api/masters/venues/:id
 */
const updateVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!venue) {
      return errorResponse(res, "Venue not found", 404);
    }

    return successResponse(res, venue, "Venue updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle venue active/inactive status
 * PATCH /api/masters/venues/:id/status
 */
const toggleVenueStatus = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return errorResponse(res, "Venue not found", 404);
    }

    venue.isActive = !venue.isActive;
    await venue.save();

    return successResponse(
      res,
      venue,
      `Venue marked as ${venue.isActive ? "active" : "inactive"}`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete venue
 * DELETE /api/masters/venues/:id
 */
const deleteVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) {
      return errorResponse(res, "Venue not found", 404);
    }

    return successResponse(res, { id: req.params.id }, "Venue deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ─── VENUE TYPES CRUD ───────────────────────────────────────────────────────

/**
 * Get all venue types
 * GET /api/masters/venues/types
 */
const getVenueTypes = async (req, res, next) => {
  try {
    const types = await VenueType.find().sort({ order: 1, createdAt: 1 });
    return successResponse(res, types, "Venue types retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Create venue type
 * POST /api/masters/venues/types
 */
const createVenueType = async (req, res, next) => {
  try {
    const { name, description, defaultDelta, icon, order } = req.body;
    if (!name) {
      return errorResponse(res, "Venue type name is required", 400);
    }

    const type = await VenueType.create({
      name: name.trim(),
      description: description || "",
      defaultDelta: defaultDelta ? Number(defaultDelta) : 0,
      icon: icon || "Building2",
      order: order ? Number(order) : 0,
      isActive: true,
    });

    return successResponse(res, type, "Venue type created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete venue type
 * DELETE /api/masters/venues/types/:id
 */
const deleteVenueType = async (req, res, next) => {
  try {
    const type = await VenueType.findByIdAndDelete(req.params.id);
    if (!type) {
      return errorResponse(res, "Venue type not found", 404);
    }
    return successResponse(res, { id: req.params.id }, "Venue type deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  toggleVenueStatus,
  deleteVenue,
  getVenueTypes,
  createVenueType,
  deleteVenueType,
};
