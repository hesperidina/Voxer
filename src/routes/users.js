const express = require("express");
const router = express.Router();

const User = require("../models/users");

const passport = require("passport");

router.get("/users/signin", (req, res) =>{
    res.render("users/signin");
});

router.post("/users/signin", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/",
}));

router.get("/users/signup", (req, res) =>{
    res.render("anuncios/allBoxs");
});

router.post("/", async (req, res) =>{
  const { name, email, password, confirmPassword }= req.body;
  const errors = [];
  if (name.length <= 0) {
    errors.push ({text: "El nombre no puede ser menor a 4 caracteres"});
  }

  if (password != confirmPassword) {
    errors.push ({text: "Las contraseñas no coinciden"});
  }
  if (password.length < 4) {
    errors.push ({text: "La contraseña debe ser mayor a 4 caracteres"});
  }
  if (errors.length > 0) {

  }
  const emailUser = await User.findOne({email: email});
  if(emailUser) {
    errors.push ({text: "El email ya esta en uso, proba con otro!"});
    res.render("anuncios/allBoxs",  {errors, name, email, password, confirmPassword});
  }
  else {

    const newUser = new User({name, email, password});
    newUser.password = await newUser.encryptPassword(password);
    await newUser.save();
    res.redirect("/");
  }
});

router.get("/users/logout",(req, res) => {
  req.logout();
  res.redirect("/");
});


module.exports = router;
