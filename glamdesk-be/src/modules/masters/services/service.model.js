const mongoose = require("mongoose");

// ─── Service Category Schema ────────────────────────────────────────────────
const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    icon: {
      type: String,
      default: "Crown",
    },
    description: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Service Package Schema ──────────────────────────────────────────────────
const serviceSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Base service amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    duration: {
      type: Number,
      default: 120, // Duration in minutes
      min: [15, "Duration must be at least 15 minutes"],
    },
    description: {
      type: String,
      default: "",
    },
    features: {
      type: [String],
      default: [],
    },
    locationType: {
      type: String,
      enum: ["Studio", "Venue", "Both"],
      default: "Both",
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-assign service code if not provided
serviceSchema.pre("save", async function (next) {
  if (!this.code) {
    const count = await this.constructor.countDocuments();
    this.code = `SRV-${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

const ServiceCategory = mongoose.model("ServiceCategory", serviceCategorySchema);
const Service = mongoose.model("Service", serviceSchema);

module.exports = {
  Service,
  ServiceCategory,
};
