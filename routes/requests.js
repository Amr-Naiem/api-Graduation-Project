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
router.post("/createRequest", async (req, res) => {
   
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
router.delete("/:id", async (req, res) => {
  try {
    
    const service = await Request.findById(req.params.id);
    
    if (service.provider_Name === req.body.username) {
      
      await service.delete();
      res.status(200).json("Service has been deleted...");
      
    } else {
      res.status(401).json("You can delete only your service!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


// GET ALL REQUESTS
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find();
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL ACCEPTED REQUESTS
router.get("/pending", async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL ACCEPTED REQUESTS
router.get("/accepted", async (req, res) => {
  try {
    const requests = await Request.find({ status: "accepted" });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL REJECTED REQUESTS
router.get("/rejected", async (req, res) => {
  try {
    const requests = await Request.find({ status: "rejected" });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET REQUESTS BY USER ID AND SORT BY DATE
router.get("/client/:client_Name", async (req, res) => {
  try {
    const { client_Name } = req.params;
    
    const requests = await Request.find({ client_Name }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});
// GET REQUESTS BY USER ID AND SORT BY DATE
router.get("/provider/:provider_Name", async (req, res) => {
  try {
    const { provider_Name } = req.params;
    const requests = await Request.find({ provider_Name }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ACCEPT REQUESTS
router.put("/:id/accept", async (req, res) => {
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
router.put("/:id/reject", async (req, res) => {
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

// TRANSFER REQUESTS
router.put("/:id/transfer", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    console.log(request)
    const toProvider = await Provider.findOne({ username: req.body.to })
    
    if (!request) {
      return res.status(400).json("Request not found");
    } 
    
    if (request.provider_Name !== req.body.from){
      return res.status(403).json("you not allowd to transfer proposal that you don't have")
    } else if (!toProvider) {
      return res.status(400).json(`${req.body.to} not found`)
    }


    if (request.status === "accepted") {
      return res.status(400).json("This request has already been accepted.");
    }

    // Update the current request to "transferred"
    request.provider_Name = req.body.to
    const updatedRequest = await request.save();
    res.status(200).json(updatedRequest);

  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;