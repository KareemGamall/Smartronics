const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/user");

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", (req,res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
