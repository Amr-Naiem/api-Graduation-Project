const router = require("express").Router();
const User = require("../models/User");
const Service = require("../models/Service");
const Provider = require("../models/Provider");
const jwt = require("jsonwebtoken");
const geolib = require('geolib');

function getDistance(lat1, lon1, lat2, lon2) {
  return geolib.getDistance({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 });
}

// a middleware function to verify JWT tokens:
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json("Access denied!");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.providerId = decoded._id;
    next();
  } catch (err) {
    res.status(400).json("Invalid token!");
  }
}

//CREATE SERVICE
router.post("/create", async (req, res) => {
  try {
    const provider = await Provider.findOne({username: req.body.provider});
    const {location} = provider;
    //console.log(provider);
    const {body} = req;
    body.location = location;
    if(provider && (provider.username === req.body.provider))
    {
      const newService = new Service(req.body);
      console.log(newService);
      const savedService = await newService.save();
      //console.log(savedService);
      res.status(200).json(savedService);
    } else {
      res.status(401).json("Unauthorized access");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE SERVICE
router.put("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service.provider === req.body.provider) {
      try {
        const updatedService = await Service.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedService);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can update only your service!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE SERVICE
router.delete("/:id", async (req, res) => {
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

//GET SERVICE
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL SERVICES
router.get("/", async (req, res) => {
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

router.get("/recommended", async (req, res) => {
  const provider = req.query.provider;
  const catName = req.query.catname;
  const userLatitude = req.query.lat; // User's current latitude
  const userLongitude = req.query.long; // User's current longitude
  console.log(userLatitude, userLongitude)
  console.log(provider)
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

    // Calculate distances between user location and service locations
    const servicesWithDistance = services.map((service) => {
      const distance = getDistance(
        userLatitude,
        userLongitude,
        service.location.coordinates[1], // Assuming longitude is stored at index 0
        service.location.coordinates[0] // Assuming latitude is stored at index 1
      );
      return { ...service._doc, distance };
    });

    res.status(200).json(servicesWithDistance);
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;