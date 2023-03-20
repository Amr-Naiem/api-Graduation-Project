const router = require("express").Router();
const Provider = require("../models/Provider");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newProvider = new Provider({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
      name: req.body.name,
      phone_number: req.body.phone_number,
      email: req.body.email,
      address: req.body.address,
    });

    const provider = await newProvider.save();
    res.status(200).json(provider);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {

    const provider = await Provider.findOne({ username: req.body.username });
    !provider && res.status(400).json("Wrong credentials!");
    if (provider) {
      const validated = await bcrypt.compare(req.body.password, provider.password);
      !validated && res.status(400).json("Wrong credentials!")
      
      const { password, ...others } = provider._doc;
      (Provider && validated) && res.status(200).json(others);
    } 
    
    //!validated && res.status(400).json("Wrong credentials!");

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
