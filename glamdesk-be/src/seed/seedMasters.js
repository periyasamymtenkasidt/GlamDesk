require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../shared/config/db");

const { Service, ServiceCategory } = require("../modules/masters/services/service.model");
const { Venue, VenueType } = require("../modules/masters/venues/venue.model");
const { Vendor, VendorRole } = require("../modules/masters/vendors/vendor.model");

// Initial Seed Data
const initialCategories = [
  { name: "Bridal & Luxury", icon: "Crown", description: "Flagship bridal, muhurtham & luxury reception packages", order: 1 },
  { name: "Party & Occasion", icon: "Gem", description: "Cocktail, sangeet, engagement & party glam", order: 2 },
  { name: "Hair & Styling", icon: "Scissors", description: "Hairstyling, extensions, braids & floral hair art", order: 3 },
  { name: "Draping & Styling", icon: "Feather", description: "Kanjeevaram saree pleating, lehenga & dupatta styling", order: 4 },
  { name: "Skincare & Spa", icon: "Sparkles", description: "Hydra-facials, cleanup, skin prep & glow therapy", order: 5 },
];

const initialServices = [
  {
    code: "SRV-001",
    name: "Royal HD Bridal Makeup",
    category: "Bridal & Luxury",
    amount: 14000,
    duration: 240,
    description: "Ultra-HD flawless bridal makeup with high-definition airbrush finish, custom lash extension installation, and luxury skin prep.",
    features: ["Airbrush HD Finish", "Hair Styling & Extensions", "Saree/Lehenga Draping", "Premium Lashes", "Jewelry Setting"],
    locationType: "Both",
    isPopular: true,
    isActive: true,
  },
  {
    code: "SRV-002",
    name: "Signature Engagement & Sagan Glam",
    category: "Bridal & Luxury",
    amount: 8000,
    duration: 180,
    description: "Radiant soft-glam look tailored for engagement and Sagan ceremonies. Long-lasting waterproof finish with customized eye makeup.",
    features: ["HD Base", "Designer Hair Styling", "Lash Extensions", "Dupatta Setting"],
    locationType: "Both",
    isPopular: true,
    isActive: true,
  },
  {
    code: "SRV-003",
    name: "Luxury Airbrush Reception Makeup",
    category: "Bridal & Luxury",
    amount: 10500,
    duration: 180,
    description: "High-end lightweight airbrush makeup with glossy nude highlights, dramatic eyes, and elegant evening updo.",
    features: ["Silicon Airbrush Base", "Intense Eye Glam", "Couture Hairstyle", "Draping"],
    locationType: "Both",
    isPopular: false,
    isActive: true,
  },
  {
    code: "SRV-004",
    name: "Party Makeup — Cocktail & Sangeet",
    category: "Party & Occasion",
    amount: 5500,
    duration: 90,
    description: "Vibrant glamorous party makeup with shimmer pigments, contouring, and party-ready textured waves.",
    features: ["Dewy Finish", "Textured Waves", "False Lashes", "Lip Plumper"],
    locationType: "Both",
    isPopular: true,
    isActive: true,
  },
  {
    code: "SRV-005",
    name: "Bridal Muhurtham Braid & Floral Hair Art",
    category: "Hair & Styling",
    amount: 4500,
    duration: 90,
    description: "Traditional South Indian wedding braid with gold Billai accessories and fresh jasmine veni attachment.",
    features: ["Jasmine Veni Setting", "Gold Billai Fitting", "Extension Lengthening", "Flyaway Lock"],
    locationType: "Both",
    isPopular: false,
    isActive: true,
  },
  {
    code: "SRV-006",
    name: "Kanjeevaram Saree Pleating & Draping",
    category: "Draping & Styling",
    amount: 2500,
    duration: 45,
    description: "Master pleating and draping with perfect 3D box folds, pinless security, and pallu waist accents.",
    features: ["Ironless Crisp Pleats", "3D Box Folds", "Weight Distribution", "Hip Chain Accent"],
    locationType: "Both",
    isPopular: true,
    isActive: true,
  },
  {
    code: "SRV-007",
    name: "Hydra-Glow Deluxe Facial & Cleanup",
    category: "Skincare & Spa",
    amount: 3500,
    duration: 75,
    description: "Deep ultrasonic skin purification, gentle enzymatic peel, and gold radiance serum infusion for brides.",
    features: ["Ultrasonic Cleanup", "Fruit Enzyme Peel", "LED Light Therapy", "Gold Infusion"],
    locationType: "Studio",
    isPopular: false,
    isActive: true,
  },
];

const initialVenueTypes = [
  { name: "Convention Hall", description: "Large AC halls and Kalyana Mandapams", defaultDelta: 7500, icon: "Building2", order: 1 },
  { name: "Hotel & Resort", description: "5-Star hotel banquets & luxury beachfront properties", defaultDelta: 6000, icon: "Castle", order: 2 },
  { name: "Marriage Hall", description: "Traditional wedding halls and community halls", defaultDelta: 4500, icon: "Building2", order: 3 },
  { name: "Outdoor & Farmhouse", description: "Open air beach, lawn & poolside setups", defaultDelta: 3500, icon: "Trees", order: 4 },
  { name: "Home / Residence", description: "Private residential dressing suites", defaultDelta: 1500, icon: "Home", order: 5 },
];

const initialVenues = [
  {
    code: "VEN-4412",
    venueName: "ITC Grand Chola, Chennai",
    venueType: "Hotel & Resort",
    description: "Luxury heritage hotel banquets and presidential bridal suites",
    travelSurcharge: 1000,
    priceDelta: 6000,
    deltaType: "premium",
    address: "63 Mount Road, Guindy",
    city: "Chennai",
    isActive: true,
  },
  {
    code: "VEN-9403",
    venueName: "Taj Coromandel, Nungambakkam",
    venueType: "Hotel & Resort",
    description: "Premier ballroom & ballroom bridal prep suite",
    travelSurcharge: 750,
    priceDelta: 6000,
    deltaType: "premium",
    address: "37 Mahatma Gandhi Road",
    city: "Chennai",
    isActive: true,
  },
  {
    code: "VEN-9404",
    venueName: "Mayor Ramanathan Chettiar Hall (MRC)",
    venueType: "Convention Hall",
    description: "Grand air-conditioned convention center with dedicated green rooms",
    travelSurcharge: 1000,
    priceDelta: 7500,
    deltaType: "premium",
    address: "Raja Annamalaipuram",
    city: "Chennai",
    isActive: true,
  },
  {
    code: "VEN-9405",
    venueName: "InterContinental Resort, ECR",
    venueType: "Outdoor & Farmhouse",
    description: "Beachfront lawn and seaside luxury pavilion",
    travelSurcharge: 1500,
    priceDelta: 5000,
    deltaType: "premium",
    address: "East Coast Road",
    city: "Chennai",
    isActive: true,
  },
];

const initialVendorRoles = [
  { name: "Hair Stylist", defaultSuggestions: ["Bridal Hair Art", "Muhurtham Braids", "Messy Buns", "Hollywood Waves"] },
  { name: "Saree Draper", defaultSuggestions: ["Kanjeevaram Pleating", "Mermaid Drape", "Lehenga Saree", "Double Pallu"] },
  { name: "Assistant Makeup Artist", defaultSuggestions: ["Skin Prep & Priming", "Airbrush Blending", "Lash Application"] },
  { name: "Mehendi Artist", defaultSuggestions: ["Bridal Cutwork", "Rajasthani Traditional", "Mandala Patterns"] },
  { name: "Photographer / BTS", defaultSuggestions: ["Cinematic Reels", "4K Video BTS", "Transition Videos"] },
];

const initialVendors = [
  {
    code: "VND-101",
    name: "Priya Sundaram",
    role: "Hair Stylist",
    phone: "+91 98401 22334",
    email: "priya.hair@gmail.com",
    experience: "6+ years",
    payoutType: "Per Event",
    defaultPayout: 2500,
    rating: 4.9,
    tags: ["Bridal Hair Art", "Muhurtham Braids", "Hollywood Waves"],
    address: "Anna Nagar, Chennai",
    notes: "Top-rated bridal hair specialist with master certifications in traditional braids.",
    isActive: true,
    bankDetails: {
      upiId: "priyasundaram@okaxis",
      accountName: "Priya Sundaram",
    },
  },
  {
    code: "VND-102",
    name: "Kavitha Ranganathan",
    role: "Saree Draper",
    phone: "+91 98412 77889",
    email: "kavitha.draping@gmail.com",
    experience: "8+ years",
    payoutType: "Per Event",
    defaultPayout: 2000,
    rating: 5.0,
    tags: ["Kanjeevaram Pleating", "Mermaid Drape", "3D Box Folds"],
    address: "Mylapore, Chennai",
    notes: "Fastest speed draper in Chennai, perfect 3D pleating in under 12 minutes.",
    isActive: true,
    bankDetails: {
      upiId: "kavithar@oksbi",
      accountName: "Kavitha Ranganathan",
    },
  },
  {
    code: "VND-103",
    name: "Sneha Varadarajan",
    role: "Assistant Makeup Artist",
    phone: "+91 98840 33445",
    email: "sneha.mua@gmail.com",
    experience: "3+ years",
    payoutType: "Per Event",
    defaultPayout: 1800,
    rating: 4.8,
    tags: ["Skin Prep & Priming", "Airbrush Blending", "Lash Application"],
    address: "T. Nagar, Chennai",
    notes: "Specialized in luxury skin prep, primer layering and airbrush base support.",
    isActive: true,
    bankDetails: {
      upiId: "sneha.v@icici",
      accountName: "Sneha Varadarajan",
    },
  },
  {
    code: "VND-104",
    name: "Divya Balakrishnan",
    role: "Mehendi Artist",
    phone: "+91 97909 55667",
    email: "divya.henna@gmail.com",
    experience: "5+ years",
    payoutType: "Per Event",
    defaultPayout: 3000,
    rating: 4.9,
    tags: ["Bridal Cutwork", "Mandala Patterns", "Organic Henna"],
    address: "Adyar, Chennai",
    notes: "Exclusive organic chemical-free dark stain henna with intricate bridal portraits.",
    isActive: true,
    bankDetails: {
      upiId: "divya.henna@okhdfcbank",
      accountName: "Divya Balakrishnan",
    },
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("[Seed] Starting Masters database seed...");

    // 1. Clear existing Masters collections
    await ServiceCategory.deleteMany({});
    await Service.deleteMany({});
    await VenueType.deleteMany({});
    await Venue.deleteMany({});
    await VendorRole.deleteMany({});
    await Vendor.deleteMany({});

    // 2. Insert Services & Categories
    await ServiceCategory.insertMany(initialCategories);
    await Service.insertMany(initialServices);
    console.log(`[Seed] ✓ Seeded ${initialCategories.length} Service Categories & ${initialServices.length} Services.`);

    // 3. Insert Venues & Venue Types
    await VenueType.insertMany(initialVenueTypes);
    await Venue.insertMany(initialVenues);
    console.log(`[Seed] ✓ Seeded ${initialVenueTypes.length} Venue Types & ${initialVenues.length} Venues.`);

    // 4. Insert Vendors & Roles
    await VendorRole.insertMany(initialVendorRoles);
    await Vendor.insertMany(initialVendors);
    console.log(`[Seed] ✓ Seeded ${initialVendorRoles.length} Vendor Roles & ${initialVendors.length} Vendors.`);

    console.log("[Seed] 🎉 All Masters data successfully seeded!");
    process.exit(0);
  } catch (error) {
    console.error("[Seed] Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
