const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Provider = require("../models/Provider");
const jwt = require('jsonwebtoken');

// a function to generate a JWT token when a user logs in successfully:
function generateToken(user) {
  const expiresIn = '365d'; // set the expiration time to 1 year
  return jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
}

// a middleware function to verify the JWT token on protected routes:
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json('Access denied!');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded._id;
    next();
  } catch (err) {
    res.status(400).json('Invalid token!');
  }
}

// Protect a route by adding the verifyToken middleware before the route handler:
router.get('/protected', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).json('Wrong credentials!');
    }

    const validated = await bcrypt.compare(req.body.password, user.password);
    if (!validated) {
      return res.status(400).json('Wrong credentials!');
    }

    const token = generateToken(user);
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, token, 'Login Success' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
