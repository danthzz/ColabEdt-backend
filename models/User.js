const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  color: { type: String, default: '#' + Math.floor(Math.random() * 16777215).toString(16) }
});

module.exports = mongoose.model('User', UserSchema);
