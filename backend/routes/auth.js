const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Registration route
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Log the incoming data for debugging
    console.log('Login attempt:', req.body);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid Email" });
    }
 // Check if the user is blocked
 if (user.isBlocked) {
  return res.status(403).json({ message: "Your account is blocked. Please contact support." });
}
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid password" });
    }
    
    console.log("JWT_SECRET: ", process.env.JWT_SECRET); 
    console.log("User data: ", user);

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );
    console.log('token',token)
    res.json({ user, token });
  } catch (error) {
    console.error("Login error:", error); // Log errors to the console
    res.status(500).json({ message: "Error logging in", error });
  }
});

module.exports = router;
