const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
  serverId: String,
  serverName: String,
  serverKey: String,
});

const Server = mongoose.model("Server", serverSchema);

module.exports = Server;
