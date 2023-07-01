const mongoose = require("mongoose");


const ServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    providerImage: {
      type: String,
    },
    provider: {
      type: String,
      required: true,
    },
    categories: {
      type: String,
      required: true,
    },
    subCategories: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    gallery: {
      type: [String],
    },
    location: {
      type: String,
    },
    geolocation: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [30, 30],
        index: "2dsphere",
      },
    },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);
