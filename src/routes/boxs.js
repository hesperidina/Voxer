const express = require("express");
const router = express.Router();
const box = require("../models/box");
const users = require("../models/users");
const comment = require("../models/comment");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination:path.join(__dirname, "../public/backgrounds"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const { isAuthenticated } = require("../helpers/auth");
const ctrl = {};
const multerUpload = multer({
  storage: storage,
  dest: path.join(__dirname, "../public/backgrounds")
}).single("imgUrl");


router.post("/publicarAnuncio", multerUpload, async (req, res) =>{
  const { title, description, price, contact, province}= req.body;
  const { filename }= req.file;
  const errors = [];
  if(!contact) {
    errors.push({text: "Sin forma de contacto"});
  }
  if(!title) {
    errors.push({text: "Titulo vacio"});
  }
  if(!description) {
    errors.push({text: "Descripcion vacia"});
  }
  if(!price) {
    errors.push({text: "Sin precio"});
  }
  if (errors.length > 0) {
    res.render("anuncios/allBoxs", {
      errors,
      title,
      filename,
      description,
      price,
      province,
      contact,
    });

  } else {
    const newBox = new box({ title, description, filename, price, contact, province});
    await newBox.save();
    res.redirect("/");

  }
});

router.get("/", async (req, res) =>{
    const boxs = await box.find().sort({date: "desc", });
  //  const box2 = await box.findById(req.params.id); //
    res.render("anuncios/allBoxs", { boxs });
});

router.get("/admin", async (req, res) =>{
    const boxs = await box.find().sort({date: "desc", });
  //  const box2 = await box.findById(req.params.id); //
    res.render("anuncios/allBoxsAdmin", { boxs });
});

router.get("/anuncios/user", async (req, res) =>{
    const boxsPropios = await box.find({user: req.user.id}).sort({date: "desc", });
    await res.render("anuncios/allBoxs2", { boxsPropios });
});

router.get("/anuncio/:id",async (req, res) => {
  try {
    const box2 = await box.findById(req.params.id);
    res.render("anuncios/viewBox", { box2 });
}
catch(box1) {
    res.render("anuncios/viewBox", { box1 });
}
});
//router.get("/edit/:id", isAuthenticated, async (req, res) =>{
//  try {
//    const box2 = await box.findById(req.params.id);
//    res.render("anuncios/editarAnuncio", {box2});
//   }
//   catch(error) {
//        res.status(error.response.status)
//        return res.send(error.message);
//      }
//});


router.put("/edit/:id", async (req, res) => {
//  await unlink(path.resolve("./src/public/background/" + box.filename));
  const {title, filename, description, price, contact, province} = req.body;
  await box.findByIdAndUpdate(req.params.id, { title, description, filename, price, contact, province});
  res.redirect("/")
});

router.delete("/delete/:id", async (req, res) => {
  await box.findByIdAndDelete(req.params.id);
//  await unlink(path.resolve("./src/public/background/" + req.box2.filename));
  res.redirect("/");
});

router.post("/anuncio/:id/comment", (req, res) =>{
//  const { image_id, name, comentario, timestamp}= req.body;
//  const newComment = new Comment({ image_id, name, comentario, timestamp});
//  const newComment = new comment(req.body);
  console.log(req.body);
  res.send({ test : "comentario" });
  //await newComment.save();
  //res.redirect("/");
});

module.exports = router;
