const router = require("express").Router();
const Provider = require("../models/Provider");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// a function to generate a JWT token when a user logs in successfully:
function generateToken(provider) {
  const expiresIn = '365d';
  return jwt.sign({ 
    _id: provider._id, 
    username: provider.username,
    role: provider.role // Include role in the JWT payload
  }, process.env.JWT_SECRET);
}

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
    const token = generateToken(provider);
    res.status(200).json({ provider, token });
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const provider = await Provider.findOne({ username: req.body.username });
    if (!provider) {
      return res.status(400).json("Wrong credentials!");
    }

    const validated = await bcrypt.compare(req.body.password, provider.password);
    if (!validated) {
      return res.status(400).json("Wrong credentials!");
    }

    // Generate JWT token and send back to client
    const tokenPayload = {
      id: provider._id,
      username: provider.username,
      role: 'provider', // Set role to 'provider'
    };
    const token = generateToken(tokenPayload);
    const { password, ...others } = provider._doc;
    const response = {
      ...others,
      role: provider.role,
      token,
    };
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;