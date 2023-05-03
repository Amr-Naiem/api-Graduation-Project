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

//CREATE REQUESTS
router.post("/createRequest", verifyToken, async (req, res) => {
  console.log(req);
    const newRequest = new Request(req.body);
  const user = await User.findOne({username: req.body.client_Name});
  try {
    if(user && (user.username === req.body.client_Name))
    {
      const savedRequest = await newRequest.save(req.body);
      res.status(200).json(savedRequest);
    } else {
      res.status(401).json("Unauthorized access");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

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
  const provider = req.query.provider;
  const catName = req.query.cat;
  
  try {
    let services;
    if (provider) {
      services = await Service.find({ provider });
    } else if (catName) {
      services = await Service.find({
        categories: {
          $in: [catName],
        },
      });
    } else {
      services = await Service.find();
    }
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ACCEPT REQUESTS
router.put("/:id/accept", verifyToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (request) {
      request.status = "accepted";
      const updatedRequest = await request.save();
      res.status(200).json(updatedRequest);
    } else {
      res.status(404).json("Request not found");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// REJECT REQUESTS
router.put("/:id/reject", verifyToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (request) {
      request.status = "rejected";
      const updatedRequest = await request.save();
      res.status(200).json(updatedRequest);
    } else {
      res.status(404).json("Request not found");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;