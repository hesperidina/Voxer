const express = require("express");
const router = express.Router();
const box = require("../models/Box");
const app = express();
const User = require("../models/users");
const AnonymIdStrategy = require('passport-anonym-uuid').Strategy;
const passport = require("passport");
var customId = require("custom-id");
router.get("/users/signin", (req, res) =>{
    res.render("users/signin");
});
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true
}));
router.post("/users/signin", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/error",
}));

passport.use(new AnonymIdStrategy());

router.post("/anonAuth",passport.authenticate('anonymId', { session: false }), (req, res) => {
  app.use(bodyParser.json());
  var password = customId({});
  var nameCreated = req.user.uuid;
  const Key = '6LdElwEaAAAAAGxwQqjrQDn9IJ-_u6NpSzut7P51'
  const VerifyUrl = 'https://google.com/recaptcha/api/siteverify?secret='+ Key +'&reponse=' + req.body.captcha + '&remoteip=' + req.connection.remoteAdress
  errors = [];

  console.log(req.body);
  console.log(req.data);

if (req.body.captcha === undefined ||
  req.body.captcha === ''||
  req.body.captcha === null
) {
  errors.push ({text: "Captcha incorrecto"});
}
if (errors.length > 0) {
    return res.json(errors[0])
}  else {
  request(VerifyUrl, (err, respose, body) => {
    body = JSON.parse
    if (body.sucess !== undefined && !body.success) {
      return res.json({text: 'Error'})
    }else {
      return res.json({text: 'jeje ta bien'})
    }

  })
}
});








router.post("/", async (req, res) =>{
  const { name, email, password, confirmPassword }= req.body;
  const errors = [];
  if (name.length <= 4) {
    errors.push ({text: "El nombre no puede ser menor a 4 caracteres"});
  } else if (name.length > 30){

      errors.push ({text: "El nombre debe ser menor a 30 caracteres"});

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
    const newUser = new User({name: name, email: email, password: password});
    newUser.password = await newUser.encryptPassword(password);
    await newUser.save();
    req.login(newUser, function (err) {
                if (!err){
                    res.redirect('/');
                } else {

                }});
}});
router.get("/users/logout",(req, res) => {
  req.logout();
  res.redirect("/");
});


module.exports = router;
