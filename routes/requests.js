const router = require("express").Router();
const User = require("../models/User");
const Service = require("../models/Service");
const Provider = require("../models/Provider");
const Request = require("../models/Request");
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


//DELETE REQUESTS
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service.provider === req.body.provider) {
      try {
        await service.delete();
        res.status(200).json("Service has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can delete only your service!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL REQUESTS
router.get("/", verifyToken, async (req, res) => {
  try {
    const requests = await Request.find();
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ACCEPT REQUESTS
router.put("/:id/accept", verifyToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    const provider = await Provider.findOne(request.provider);
    if (!request) {
      return res.status(404).json("Request not found");
    } else if (!provider) {
      return res.status(404).json("Provider not found");
    }

    // Check if user has provider role
    if (req.user.role !== 'provider') {
      return res.status(401).json("Access denied! Only providers can accept requests.");
    }

    request.status = "accepted";
    const updatedRequest = await request.save();
    res.status(200).json(updatedRequest);
  } catch (err) {
    res.status(500).json(err);
  }
});

// REJECT REQUESTS
router.put("/:id/reject", verifyToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json("Request not found");
    }

    const provider = await Provider.findOne(request.provider);
    if (!provider) {
      return res.status(404).json("Provider not found");
    }

    // Check if user has provider role
    if (req.user.role !== 'provider') {
      return res.status(401).json("Access denied! Only providers can reject requests.");
    }

    request.status = "rejected";
    const updatedRequest = await request.save();
    res.status(200).json(updatedRequest);
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;