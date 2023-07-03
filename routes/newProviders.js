const router = require("express").Router();
const Provider = require("../models/Provider");
const NewProviders = require("../models/newProviders");
const Service = require("../models/Service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json("Access denied!");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json("Invalid token");
  }
};

//GET ALL NEW PROVIDERS
router.get("/", verifyToken, async (req, res) => {
  try {
    const newproviders = await NewProviders.find();
    res.status(200).json(newproviders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Accept
router.put("/accept/:id", verifyToken, async (req, res) => {
    try {
      const newProvider = await NewProviders.findOne({ _id: req.params.id });
      if (!newProvider) {
        return res.status(404).json("New provider not found!");
      }
      newProvider.status = "accepted";
      await newProvider.save();
      
      // Create a new provider based on the new provider data
      const provider = new Provider({
        username: newProvider.username,
        password: newProvider.password,
        name: newProvider.name,
        email: newProvider.email,
        phone_number: newProvider.phone_number,
        address: newProvider.address,
        profilePic: newProvider.profilePic,
        location: newProvider.location,
      });
      
      // Save the new provider to the database
      const savedProvider = await provider.save();
      
      // Remove the accepted provider from the newProviders collection
      await NewProviders.findByIdAndDelete(req.params.id);
  
      res.status(200).json(savedProvider);
    } catch (err) {
      res.status(500).json(err);
    }
  });

// REJECT NEW PROVIDER
router.put("/reject/:id", verifyToken, async (req, res) => {
  try {
    const newProvider = await NewProviders.findOne({ _id: req.params.id });
    if (!newProvider) {
      return res.status(404).json("New provider not found!");
    }
    newProvider.status = "rejected";
    await newProvider.save();
    res.status(200).json("New provider has been rejected...");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;