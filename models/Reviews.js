const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({

  client_Name: {
    type: String,
    required: true
    },
  provider_Name: {
    type: String,
    required: true
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
module.exports = mongoose.model("Review", reviewSchema);