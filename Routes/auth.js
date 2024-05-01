
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../Models/user");

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Please provide username and password" });
    }

    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY);

    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login an existing user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Please provide username and password" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare the password with the hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
    
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
