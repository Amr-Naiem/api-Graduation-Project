const router = require("express").Router();
const User = require("../models/User");
const Service = require("../models/Service");

//CREATE SERVICE
router.post("/create", async (req, res) => {
  const newService = new Service(req.body);
  try {
    const savedService = await newService.save();
    res.status(200).json(savedService);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE SERVICE
router.put("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service.username === req.body.username) {
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
    if (service.username === req.body.username) {
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
  const username = req.query.user;
  const catName = req.query.cat;
  try {
    let services;
    if (username) {
      services = await Service.find({ username });
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

module.exports = router;
