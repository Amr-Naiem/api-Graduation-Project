const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  timestamps: {
    type: Date,
    required: true,
    default: Date.now,
  },
  image: {
    type: String,
    required: true,
  },
});

const ServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: false,
    },
    desc: {
      type: String,
      required: true,
    },
    providerImage: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    categories: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    reviews: [reviewSchema],
    gallery: {
      type: [String],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);
