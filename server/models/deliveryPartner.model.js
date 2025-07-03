const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    // Personal Information
    name: {
      type: String,
      required: [true, "Partner name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    
    // Authentication
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    
    // Verification & Documents
    isVerified: {
      type: Boolean,
      default: false,
    },
    documentsUploaded: {
      drivingLicense: { type: String, default: "" },
      vehicleRegistration: { type: String, default: "" },
      insurance: { type: String, default: "" },
      aadharCard: { type: String, default: "" },
      panCard: { type: String, default: "" },
    },
    
    // Vehicle Information
    vehicleDetails: {
      type: {
        type: String,
        enum: ["bike", "scooter", "bicycle", "car", "van"],
        required: true,
      },
      brand: String,
      model: String,
      year: Number,
      plateNumber: {
        type: String,
        required: true,
        uppercase: true,
      },
      color: String,
    },
    
    // Location & Availability
    currentLocation: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
      address: String,
      lastUpdated: { type: Date, default: Date.now },
    },
    
    serviceAreas: [{
      pincode: String,
      area: String,
      radius: { type: Number, default: 5 }, // in kilometers
    }],
    
    availability: {
      isOnline: { type: Boolean, default: false },
      isOnDuty: { type: Boolean, default: false },
      lastSeen: { type: Date, default: Date.now },
      workingHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "22:00" },
      },
    },
    
    // Performance Metrics
    statistics: {
      totalDeliveries: { type: Number, default: 0 },
      successfulDeliveries: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0, min: 0, max: 5 },
      totalRatings: { type: Number, default: 0 },
      onTimeDeliveries: { type: Number, default: 0 },
      avgDeliveryTime: { type: Number, default: 0 }, // in minutes
      totalEarnings: { type: Number, default: 0 },
      currentMonthEarnings: { type: Number, default: 0 },
    },
    
    // Ratings & Reviews
    ratings: [{
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    }],
    
    // Financial Information
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String,
    },
    
    // Emergency Contact
    emergencyContact: {
      name: String,
      mobile: String,
      relationship: String,
    },
    
    // System Fields
    status: {
      type: String,
      enum: ["pending", "approved", "suspended", "blocked"],
      default: "pending",
    },
    lastActiveOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    socketId: String, // For real-time communication
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
deliveryPartnerSchema.index({ email: 1 });
deliveryPartnerSchema.index({ mobile: 1 });
deliveryPartnerSchema.index({ "currentLocation.latitude": 1, "currentLocation.longitude": 1 });
deliveryPartnerSchema.index({ "availability.isOnline": 1, "availability.isOnDuty": 1 });
deliveryPartnerSchema.index({ "serviceAreas.pincode": 1 });
deliveryPartnerSchema.index({ status: 1 });

// Instance methods
deliveryPartnerSchema.methods.updateLocation = function(latitude, longitude, address) {
  this.currentLocation = {
    latitude,
    longitude,
    address,
    lastUpdated: new Date(),
  };
  return this.save();
};

deliveryPartnerSchema.methods.goOnline = function() {
  this.availability.isOnline = true;
  this.availability.lastSeen = new Date();
  return this.save();
};

deliveryPartnerSchema.methods.goOffline = function() {
  this.availability.isOnline = false;
  this.availability.isOnDuty = false;
  this.availability.lastSeen = new Date();
  return this.save();
};

deliveryPartnerSchema.methods.updateRating = function(newRating) {
  const totalRatings = this.statistics.totalRatings + 1;
  const totalScore = (this.statistics.avgRating * this.statistics.totalRatings) + newRating;
  this.statistics.avgRating = totalScore / totalRatings;
  this.statistics.totalRatings = totalRatings;
  return this.save();
};

// Static methods
deliveryPartnerSchema.statics.findNearbyPartners = function(latitude, longitude, radiusKm = 10) {
  return this.find({
    "availability.isOnline": true,
    "availability.isOnDuty": false,
    status: "approved",
    "currentLocation.latitude": {
      $gte: latitude - (radiusKm / 111.32),
      $lte: latitude + (radiusKm / 111.32),
    },
    "currentLocation.longitude": {
      $gte: longitude - (radiusKm / (111.32 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (radiusKm / (111.32 * Math.cos(latitude * Math.PI / 180))),
    },
  }).sort({ "statistics.avgRating": -1, "statistics.totalDeliveries": -1 });
};

const DeliveryPartnerModel = mongoose.model("DeliveryPartner", deliveryPartnerSchema);

module.exports = DeliveryPartnerModel;