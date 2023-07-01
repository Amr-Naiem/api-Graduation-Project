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

//GET RECOMMENDED SERVICES

router.get("/recommended/:catName", async (req, res) => {
  //const userid = req.params.userid;
  const provider = req.query.provider;
  const catName = req.params.catname;
  const userLatitude = parseFloat(req.query.lat); // User's current latitude
  const userLongitude = parseFloat(req.query.long); // User's current longitude
  console.log(provider);
  console.log(catName);
  console.log(userLatitude, userLongitude);

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
      const distance = geolib.getDistance(
        { latitude: userLatitude, longitude: userLongitude },
        { latitude: service.geolocation.coordinates[1], longitude: service.geolocation.coordinates[0] }
      );
      return { ...service._doc, distance };
    });

    // Sort the services by distance in ascending order (nearest first)
    servicesWithDistance.sort((a, b) => a.distance - b.distance);
    

    res.status(200).json(servicesWithDistance.slice(0, 4));
  } catch (err) {
    res.status(500).json(err);
  }
});


  // GET FAVORITE SERVICES
  router.get("/:userId/favorite", async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId).populate('favoriteServices');
      const favoriteServices = user.favoriteServices;
      res.status(200).json(favoriteServices);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  //ADD SERVICE TO FAVORITES
  router.post("/favorite/add", async (req, res) => {
    try {
      const user = await User.findById(req.body.userId);
      const service = await Service.findById(req.body.serviceId);
      if (!user || !service) {
        res.status(404).json("User or service not found");
      } else if (user.favoriteServices.includes(service._id)) {
        res.status(400).json("Service already in favorites");
      } else {
        user.favoriteServices.push(service._id);
        service.isFavorite = true; // Set isFavorite to true
        await Promise.all([user.save(), service.save()]);
        res.status(200).json("Service added to favorites");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  // REMOVE SERVICE FROM FAVORITES
  router.delete("/favorite/remove", async (req, res) => {
    try {
      const user = await User.findById(req.body.userId);
      const serviceId = req.body.serviceId;
      if (!user.favoriteServices.includes(serviceId)) {
        res.status(400).json("Service not found in favorites");
      } else {
        user.favoriteServices.pull(serviceId);
        await user.save();
        res.status(200).json("Service removed from favorites");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  
  module.exports = router;