const mongoose = require("mongoose");

// ─── Venue Type Schema ───────────────────────────────────────────────────────
const venueTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Venue type name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    defaultDelta: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: "Building2",
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

// ─── Venue Schema ────────────────────────────────────────────────────────────
const venueSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    venueName: {
      type: String,
      required: [true, "Venue name is required"],
      trim: true,
    },
    venueType: {
      type: String,
      required: [true, "Venue type is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    travelSurcharge: {
      type: Number,
      default: 0,
      min: [0, "Travel surcharge cannot be negative"],
    },
    priceDelta: {
      type: Number,
      default: 0,
      min: [0, "Price delta cannot be negative"],
    },
    deltaType: {
      type: String,
      enum: ["premium", "discount", "none"],
      default: "premium",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "Chennai",
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

// Auto-assign code if not provided
venueSchema.pre("save", async function (next) {
  if (!this.code) {
    const count = await this.constructor.countDocuments();
    this.code = `VEN-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

const VenueType = mongoose.model("VenueType", venueTypeSchema);
const Venue = mongoose.model("Venue", venueSchema);

module.exports = {
  Venue,
  VenueType,
};
