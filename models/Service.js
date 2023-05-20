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
      required: false,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);
