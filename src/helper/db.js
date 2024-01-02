const mongoose = require("mongoose");
const { DB_URL } = require("../utils/config");

async function connectToDatabase() {
  try {
    await mongoose.connect(DB_URL);

    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    console.log("MongoDB Error", error);
    throw error;
  }
}

module.exports = connectToDatabase;
