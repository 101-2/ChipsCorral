const express = require("express");

const router = express.Router();

router.get("/logout", (req, res) => {
  res.logout();
  res.redirect("/");
});

module.exports = router;
