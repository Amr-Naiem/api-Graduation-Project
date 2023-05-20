const router = require("express").Router();
const Review = require("../models/Reviews");
const User = require("../models/User");
const Provider = require("../models/Provider");
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

// CREATE REVIEW
router.post("/create", verifyToken, async (req, res) => {
    const newReview = new Review(req.body);
    const provider = await Provider.findOne({username:req.body.provider_Name});
    try {
      if (provider) {
        newReview.provider = provider.username;
        newReview.author = req.body.client_Name;
        const savedReview = await newReview.save();
        res.status(200).json(savedReview);
      } else {
        res.status(404).json("Provider not found");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  });


//UPDATE REVIEW
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const review= await Review.findById(req.params.id);
    if (review.provider === req.body.provider) {
      try {
        const updatedReview = await Review.findOneAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedReview);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can update only your review!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE REVIEW
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (review.provider === req.body.provider) {
      try {
        await review.delete();
        res.status(200).json("Review has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can delete only your review!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET REVIEW
router.get("/:provider_Name", async (req, res) => {
  try {
    const review = await Review.findOne({provider_Name:req.params.provider_Name});
    res.status(200).json(review);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL REVIEWS
router.get("/", async (req, res) => {
  const provider = req.query.provider;
  try {
    let reviews;
    if (provider) {
      reviews = await Review.find({ provider });
    } else {
      reviews = await Review.find();
    }
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;