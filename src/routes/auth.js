const express = require("express");
const Users = require("../models/users");
const Servers = require("../models/servers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { genSecretKey, encrypt, decrypt } = require("../utils/crypto");

const router = express.Router();

router.post("/as", async (req, res) => {
  try {
    const { username, password } = req.body;

    // username and password is required

    if (!username || !password) {
      return res.status(400).json({
        message: "username and password is required",
      });
    }

    // find user by username
    const user = await Users.findOne({
      username: username,
    });

    // if user not found
    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    // validate password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        message: "invalid password",
      });
    }

    // Generate Tgt with using user's key, exp time 1 hour
    const message = `${user.username}:${user.role}:${Date.now() + 3600000}`;

    // Encrypt message with user's key
    const tgt = await encrypt(user.key, message);

    // Return tgt
    return res.status(200).json({
      message: "success",
      tgt,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "internal server error",
    });
  }
});

router.post("/tgs", async (req, res) => {
  try {
    const { username, tgt, serverId } = req.body;

    // username , tgt, serverId is required
    if (!username || !tgt || !serverId) {
      return res.status(400).json({
        message: "username , tgt, serverId is required",
      });
    }

    // find user by username
    const user = await Users.findOne({
      username: username,
    });

    let decryptedTgt;

    try {
      // decrypt tgt with user's key
      decryptedTgt = await decrypt(user.key, tgt);
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        message: "invalid tgt",
      });
    }

    // split decrypted tgt
    const splittedTgt = decryptedTgt.split(":");
    const _username = splittedTgt[0];

    // validate username
    if (_username !== username) {
      return res.status(400).json({
        message: "invalid tgt",
      });
    }

    // Check tgt expired
    const expired = splittedTgt[2];
    if (Date.now() > new Date(expired)) {
      return res.status(400).json({
        message: "tgt expired",
      });
    }

    // Get server
    const server = await Servers.findOne({
      serverId: serverId,
    });

    // if server not found
    if (!server) {
      return res.status(404).json({
        message: "server not found",
      });
    }

    // Generate TGS will be JWT with using server's key
    const message = {
      username: username,
      serverId: serverId,
      role: user.role,
      expired: Date.now() + 3600000,
    };

    // Encrypt message with server's key
    const token = jwt.sign(message, server.serverKey);

    // Return tgs
    return res.status(200).json({
      message: "success",
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "internal server error",
    });
  }
});

module.exports = router;
