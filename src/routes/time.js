const express = require("express");

const router = express.Router();

router.get("/now", async (req, res) => {
  return res.status(200).json({
    message: "success",
    now: new Date(),
  });
});

module.exports = router;
