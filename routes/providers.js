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

//UPDATE
router.put("/:id", verifyToken, async (req, res) => {
  if (req.body.providerId === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updatedProvider = await Provider.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedProvider);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(401).json("You can update only your account!");
  }
});

//DELETE
router.delete("/:id", verifyToken, async (req, res) => {
  if (req.body.providerId === req.params.id) {
    try {
      const provider = await Provider.findById(req.params.id);
      try {
        await Service.deleteMany({ username: provider.username });
        await Provider.findByIdAndDelete(req.params.id);
        res.status(200).json("Provider has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
    } catch (err) {
      res.status(404).json("Provider not found!");
    }
  } else {
    res.status(401).json("You can delete only your account!");
  }
});

//GET PROVIDER
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    const { password, ...others } = provider._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL NEW PROVIDERS
router.get("/", verifyToken, async (req, res) => {
  try {
    const newproviders = await NewProviders.find();
    res.status(200).json(newproviders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ACCEPT NEW PROVIDER
router.put("/accept/:id", verifyToken, async (req, res) => {
  try {
    const newProvider = await NewProviders.findOne({ _id: req.params.id });
    if (!newProvider) {
      return res.status(404).json("New provider not found!");
    }
    newProvider.status = "accepted";
    await newProvider.save();
    res.status(200).json(newProvider);
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