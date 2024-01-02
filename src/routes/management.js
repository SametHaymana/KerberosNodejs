const Users = require("../models/users");
const Servers = require("../models/servers");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { genSecretKey } = require("../utils/crypto");

const router = express.Router();

// Management server id
const SERVER_ID = "management";

// User enpoints

// Get my account
router.get("/me", async (req, res) => {
  try {
    const { tgt } = req.headers;

    // Get Server by id
    const server = await Servers.findOne({
      serverId: SERVER_ID,
    });

    // Decrypt tgt
    const decryptedTgt = jwt.verify(tgt, server.serverKey);

    // Get username from tgt
    const username = decryptedTgt.username;

    // Find user by username
    const user = await Users.findOne({
      username: username,
    });

    // Return user
    return res.status(200).json({
      message: "success",
      user,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: "Token is invalid",
      });
    }

    console.log(error);
    return res.status(500).json({
      message: "internal server error",
    });
  }
});

// Update user password
router.post("/updatePass", async (req, res) => {
  try {
    const { tgt } = req.headers;
    const { password } = req.body;

    // Get Server by id
    const server = await Servers.findOne({
      serverId: SERVER_ID,
    });

    // Decrypt tgt
    const decryptedTgt = jwt.verify(tgt, server.serverKey);

    // Get username from tgt
    const username = decryptedTgt.username;

    // Find user by username
    const user = await Users.findOne({
      username: username,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    user.password = hashedPassword;

    // Save user
    await user.save();

    // Return user
    return res.status(200).json({
      message: "success",
      user,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: "Token is invalid",
      });
    }
    console.log(error);

    return res.status(500).json({
      message: "internal server error",
    });
  }
});

// Admin endpoints

// Get all users
router.get("/users", async (req, res) => {
  try {
    const { tgt } = req.headers;

    // Get Server by id
    const server = await Servers.findOne({
      serverId: SERVER_ID,
    });

    // Decrypt tgt
    const decryptedTgt = jwt.verify(tgt, server.serverKey);

    // Get username from tgt
    const username = decryptedTgt.username;

    // Find user by username
    const user = await Users.findOne({
      username: username,
    });

    // Check user role
    if (user.role !== "admin") {
      return res.status(401).json({
        message: "unauthorized",
      });
    }

    // Find all users
    const users = await Users.find();

    // Return users
    return res.status(200).json({
      message: "success",
      users,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: "Token is invalid",
      });
    }
    console.log(error);

    return res.status(500).json({
      message: "internal server error",
    });
  }
});

// Create user
router.post("/users", async (req, res) => {
  try {
    const { tgt } = req.headers;
    const { username, email, password, role } = req.body;

    // Get Server by id
    const server = await Servers.findOne({
      serverId: SERVER_ID,
    });

    // Decrypt tgt
    const decryptedTgt = jwt.verify(tgt, server.serverKey);

    // Get username from tgt
    const _username = decryptedTgt.username;

    // Find user by username
    const user = await Users.findOne({
      username: _username,
    });

    // Check user role
    if (user.role !== "admin") {
      return res.status(401).json({
        message: "unauthorized",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate secret key
    const key = genSecretKey();

    // Create user
    const newUser = new Users({
      username,
      email,
      password: hashedPassword,
      key,
      role,
    });

    // Save user
    await newUser.save();

    // Return user
    return res.status(200).json({
      message: "success",
      user: newUser,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: "Token is invalid",
      });
    }
    console.log(error);

    return res.status(500).json({
      message: "internal server error",
    });
  }
});

// Update management server key
router.post("/updateServerKey", async (req, res) => {
  try {
    const { tgt } = req.headers;
    const { serverKey } = req.body;

    // Get Server by id
    const server = await Servers.findOne({
      serverId: SERVER_ID,
    });

    // Decrypt tgt
    const decryptedTgt = jwt.verify(tgt, server.serverKey);

    // Get username from tgt
    const username = decryptedTgt.username;

    // Find user by username
    const user = await Users.findOne({
      username: username,
    });

    // Check user role
    if (user.role !== "admin") {
      return res.status(401).json({
        message: "unauthorized",
      });
    }

    // Update server key
    server.serverKey = serverKey;

    // Save server
    await server.save();

    // Return server
    return res.status(200).json({
      message: "success",
      server,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: "Token is invalid",
      });
    }
    console.log(error);

    return res.status(500).json({
      message: "internal server error",
    });
  }
});

// Export router
module.exports = router;
