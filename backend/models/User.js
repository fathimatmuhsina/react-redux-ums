const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false },
  profileImage: { type: String }, // Add this field for storing the image path
  isBlocked:{type:Boolean,default:false},
});

module.exports = mongoose.model('User', UserSchema);
