const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // username must be unique
  },
  email: String,
  password: String,
  key: String,
  role: {
    type: String,
    default: "user", // user, admin
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
