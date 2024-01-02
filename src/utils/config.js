const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(`.env`),
});

module.exports = {
  PORT: process.env.PORT || 5000,
  SECRET: process.env.SECRET || "secret",
  DB_URL: process.env.DB_URL || "",
};
