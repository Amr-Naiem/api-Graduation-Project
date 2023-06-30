const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      unique: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone_number: {
      type: Number,
      unique: true,
    },
    address: {
      type: String,
      unique: false,
    },
    profilePic: {
      type: String,
      default: "",
    },
    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Provider", ProviderSchema);
