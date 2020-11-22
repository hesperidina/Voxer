const express = require("express");
const router = express.Router();

const users = require("../models/users");


router.get("/about", (req, res) =>{
  res.render("about");
});




module.exports = router;
