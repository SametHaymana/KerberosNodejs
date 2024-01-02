const Users = require("../models/users");
const Servers = require("../models/servers");
const { genSecretKey } = require("../utils/crypto");
const bcrypt = require("bcrypt");

// Function to create admin user
// And create management server
const createDefault = async () => {
  try {
    // Check if admin user already exists
    const adminUserExists = await Users.findOne({
      username: "admin",
    });

    if (!adminUserExists) {
      const hashedPassword = await bcrypt.hash("admin", 10);

      // Create admin user
      const adminUser = new Users({
        username: "admin",
        email: "admin@admin.com",
        password: hashedPassword,
        key: genSecretKey(),
        role: "admin",
      });

      // Save admin user
      await adminUser.save();
    }

    // Check if management server already exists
    const managementServerExists = await Servers.findOne({
      serverId: "management",
    });

    if (!managementServerExists) {
      // Create management server
      const managementServer = new Servers({
        serverId: "management",
        serverKey: genSecretKey(),
      });

      // Save management server
      await managementServer.save();
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = createDefault;
