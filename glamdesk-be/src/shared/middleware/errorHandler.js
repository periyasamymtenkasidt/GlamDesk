const { errorResponse } = require("../utils/response");

// 404 Route Not Found Middleware
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route not found - ${req.originalUrl}`, 404);
};

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.name}: ${err.message}`, err.stack);

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return errorResponse(res, "Validation Error", 400, messages);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return errorResponse(res, `Duplicate value entered for '${field}', must be unique.`, 400);
  }

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === "CastError") {
    return errorResponse(res, `Resource not found with id: ${err.value}`, 404);
  }

  return errorResponse(res, err.message || "Server Error", err.statusCode || 500);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
