const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require("express-validator");


const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route to get the authenticated user's profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error });
  }
});

// Route to update user details (name and email)

router.put(
  "/profile",
  authMiddleware,
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters")
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Name must contain only letters and spaces"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is not valid")
      .custom(async (email, { req }) => {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.id !== req.user.id) {
          throw new Error("Email is already in use");
        }
        return true;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.name = name;
      user.email = email;
      await user.save();

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error updating user details", error });
    }
  }
);


// Route to update profile picture
router.put('/profile/picture', authMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user's profile picture
    user.profileImage = req.file.path;
    await user.save();

    res.json({ message: 'Profile picture updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile picture', error });
  }
});

module.exports = router;
