const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const User = require("../models/User");

router.post("/createPayment", async (req, res) => {
  const { amount, clientName } = req.body;
  const user = await User.findOne({ username: clientName });

  try {
    if (user && (user.username === clientName)) {
      const payment = new Payment({ amount, user: user._id });
      await payment.save();
      res.status(200).json(payment);
    } else {
      res.status(401).json("Unauthorized access");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL PAYMENTS
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find().populate({
      path: "user",
      select: "-password",
    });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;