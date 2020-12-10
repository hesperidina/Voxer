const express = require("express");
const router = express.Router();
const box = require("../models/Box");
const User = require("../models/users");

const passport = require("passport");

router.get("/users/signin", (req, res) =>{
    res.render("users/signin");
});

router.post("/users/signin", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/error",
}));

router.get("/users/signup", (req, res) =>{
    res.render("anuncios/allBoxs");
});

router.post("/", async (req, res) =>{
  const { name, email, password, confirmPassword }= req.body;
  const errors = [];
  if (name.length <= 4) {
    errors.push ({text: "El nombre no puede ser menor a 4 caracteres"});
  } else if (name.length > 30){

      errors.push ({text: "el nombre debe ser menor a 30 caracteres"});

  }
  else {
    const nameUser = await User.findOne({name: name});
    if(nameUser) {
      errors.push ({text: "El usuario ya existe, proba con otro"});
      }
  }
  if (email.length <= 12) {
    errors.push ({text: "Asegurate de ingresar tu mail correctamente"});
  } else if (email.length > 50) {
      errors.push ({text: "Asegurate de ingresar tu mail correctamente (el mail es demasiado largo)"});
  }
  else {
    const emailUser = await User.findOne({email: email});
    if(emailUser) {
      errors.push ({text: "El email ya esta en uso, proba con otro"});
      }
  }
  if (password.length < 4) {
    errors.push ({text: "La contraseña debe ser mayor a 4 caracteres"});
  } else if (password.length > 30) {
      errors.push ({text: "La contraseña debe ser menor a 30 caracteres"});
    }
    else if (password != confirmPassword) {
        errors.push ({text: "Las contraseñas no coinciden"});
    }

    if (errors.length > 0) {
        var boxs = await box.find().sort({updatedDate: "desc", });
         res.render("anuncios/allBoxs", { boxs, errors });
    }  else {

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
