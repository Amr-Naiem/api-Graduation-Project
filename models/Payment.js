const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: {
      _id: mongoose.Schema.Types.ObjectId,
      username: String,
      name: String,
      phone_number: String,
      email: String,
      profilePic: String,
    },
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);