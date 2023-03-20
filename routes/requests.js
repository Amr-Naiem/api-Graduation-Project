const router = require("express").Router();
const User = require("../models/User");
const Service = require("../models/Service");
const Provider = require("../models/Provider");
const Request = require("../models/Request");

//CREATE REQUESTS
router.post("/createRequest", async (req, res) => {
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


//GET ALL REQUESTS
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

module.exports = router;
