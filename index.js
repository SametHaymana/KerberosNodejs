const express = require("express");
const cors = require("cors");
const { PORT } = require("./src/utils/config");
const connectToDatabase = require("./src/helper/db");
const createDefault = require("./src/utils/createDefoult");

// Routers
const authRouter = require("./src/routes/auth");
const timeRouter = require("./src/routes/time");
const managementRouter = require("./src/routes/management");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRouter);
app.use("/time", timeRouter);
app.use("/management", managementRouter);

// Server
// Database
connectToDatabase()
  .then(() => {
    createDefault();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(console.log);
