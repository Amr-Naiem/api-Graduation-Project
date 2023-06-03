const router = require("express").Router();
const { SubCategory, Category } = require("../models/Category");

router.post("/main", async (req, res) => {
  const newCat = new Category(req.body);
  try {
    const savedCat = await newCat.save();
    res.status(200).json(savedCat);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/sub", async (req, res) => {
  const mainCat = await Category.findOne({name: req.body.main});
  const newCat = new SubCategory(req.body);
  try {
    if (mainCat) {
      const savedCat = await newCat.save();
      res.status(200).json(savedCat);
    }
    else {res.status(400).json("Main category does not exist")}
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/main", async (req, res) => {
    try {
      const cats = await Category.find();
      res.status(200).json(cats);
    } catch (err) {
      res.status(500).json(err);
    }
  });

router.get("/:main", async (req, res) => {
  try {
    const cats = await SubCategory.find({main: req.params.main});
    res.status(200).json(cats);
  } catch (err) {
    res.status(500).json(err);
  }
});  

module.exports = router;
