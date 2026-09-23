const mongoose = require("mongoose");

// ─── Vendor Role Schema ─────────────────────────────────────────────────────
const vendorRoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
      unique: true,
    },
    defaultSuggestions: {
      type: [String],
      default: [],
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

// ─── Vendor Freelancer / Collaborator Schema ────────────────────────────────
const vendorSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Primary role is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    experience: {
      type: String,
      default: "3+ years",
    },
    payoutType: {
      type: String,
      enum: ["Per Event", "Fixed Monthly", "Hourly"],
      default: "Per Event",
    },
    defaultPayout: {
      type: Number,
      default: 2000,
      min: [0, "Payout cannot be negative"],
    },
    rating: {
      type: Number,
      default: 4.8,
      min: [1, "Rating cannot be below 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    tags: {
      type: [String],
      default: [],
    },
    address: {
      type: String,
      default: "Chennai, Tamil Nadu",
    },
    notes: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Bank & UPI details (internal confidential record)
    bankDetails: {
      upiId: { type: String, default: "" },
      accountName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" },
    },
    // Calendar availability / blocked dates / leaves
    availability: [
      {
        date: { type: String, required: true }, // Format: YYYY-MM-DD
        status: { type: String, enum: ["Booked", "Leave", "Available"], default: "Leave" },
        reason: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-assign code if not provided
vendorSchema.pre("save", async function (next) {
  if (!this.code) {
    const count = await this.constructor.countDocuments();
    this.code = `VND-${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

const VendorRole = mongoose.model("VendorRole", vendorRoleSchema);
const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = {
  Vendor,
  VendorRole,
};
