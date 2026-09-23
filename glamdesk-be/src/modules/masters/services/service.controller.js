const { Service, ServiceCategory } = require("./service.model");
const { successResponse, errorResponse } = require("../../../shared/utils/response");

// ─── SERVICES CRUD ──────────────────────────────────────────────────────────

/**
 * Get all services with optional search and category filters
 * GET /api/masters/services
 */
const getServices = async (req, res, next) => {
  try {
    const { category, search, activeOnly } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (activeOnly === "true") {
      filter.isActive = true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const services = await Service.find(filter).sort({ createdAt: -1 });
    return successResponse(res, services, "Services retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get single service by ID
 * GET /api/masters/services/:id
 */
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return errorResponse(res, "Service not found", 404);
    }
    return successResponse(res, service, "Service retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Create new service
 * POST /api/masters/services
 */
const createService = async (req, res, next) => {
  try {
    const { name, category, amount, duration, description, features, locationType, isPopular } = req.body;

    if (!name || !category || amount === undefined) {
      return errorResponse(res, "Name, category, and base amount are required", 400);
    }

    const newService = await Service.create({
      name,
      category,
      amount: Number(amount),
      duration: duration ? Number(duration) : 120,
      description: description || "",
      features: Array.isArray(features) ? features : [],
      locationType: locationType || "Both",
      isPopular: Boolean(isPopular),
      isActive: true,
    });

    return successResponse(res, newService, "Service created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update service
 * PUT /api/masters/services/:id
 */
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return errorResponse(res, "Service not found", 404);
    }

    return successResponse(res, service, "Service updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle service active/inactive status
 * PATCH /api/masters/services/:id/status
 */
const toggleServiceStatus = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return errorResponse(res, "Service not found", 404);
    }

    service.isActive = !service.isActive;
    await service.save();

    return successResponse(
      res,
      service,
      `Service marked as ${service.isActive ? "active" : "inactive"}`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete service
 * DELETE /api/masters/services/:id
 */
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return errorResponse(res, "Service not found", 404);
    }

    return successResponse(res, { id: req.params.id }, "Service deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ─── SERVICE CATEGORIES CRUD ────────────────────────────────────────────────

/**
 * Get all service categories
 * GET /api/masters/services/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await ServiceCategory.find().sort({ order: 1, createdAt: 1 });
    return successResponse(res, categories, "Categories retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Create service category
 * POST /api/masters/services/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, icon, description, order } = req.body;
    if (!name) {
      return errorResponse(res, "Category name is required", 400);
    }

    const category = await ServiceCategory.create({
      name: name.trim(),
      icon: icon || "Crown",
      description: description || "",
      order: order ? Number(order) : 0,
      isActive: true,
    });

    return successResponse(res, category, "Category created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete service category
 * DELETE /api/masters/services/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }
    return successResponse(res, { id: req.params.id }, "Category deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  toggleServiceStatus,
  deleteService,
  getCategories,
  createCategory,
  deleteCategory,
};
