const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      unique: false,
    },
    phone_number: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    favoriteServices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
