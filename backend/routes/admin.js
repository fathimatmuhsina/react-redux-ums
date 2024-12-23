const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Import JWT to verify token
const router = express.Router();
const bcrypt=require('bcryptjs')

// Middleware to authenticate and authorize requests based on JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Extract token from Authorization header
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // Attach decoded user data to the request object
    next(); // Pass the request to the next handler
  });
};

// Get all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'You are not authorized to view all users' });
  }

  const users = await User.find();
  res.json(users);
});

router.put('/users/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'You are not authorized to update users' });
  }

  try {
    const { name, email } = req.body;
    console.log('Attempting to update user:', req.params.id, name, email);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User updated successfully:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Block a user
router.put('/users/block/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'You are not authorized to block users' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = true;
    await user.save();

    res.json({ message: 'User blocked successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to block user' });
  }
});

// Unblock a user
router.put('/users/unblock/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'You are not authorized to unblock users' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = false;
    await user.save();

    res.json({ message: 'User unblocked successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to unblock user' });
  }
});


// Route to add a new user (admin only)
router.post('/users', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'You are not authorized to add users' });
  }

  const { name, email, password } = req.body;

  // Validate that all required fields are present
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword, // You should hash the password before saving it in production
      isAdmin: false, // Set this to true if you want to add an admin user
      isBlocked:false,
    });
   

    // Save the new user to the database
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});


// Delete a user by ID (admin only)
router.delete('/users/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'You are not authorized to delete users' });
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});


module.exports = router;
