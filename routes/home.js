const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("pages/home", { name: req.user.displayName });
});

module.exports = router;
