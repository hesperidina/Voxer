const express = require("express");
const router = express.Router();
const box = require("../models/Box");
const app = express();
//const io = require('socket.io').listen(8001);
const users = require("../models/users");
const deletedVox = require("../models/DeletedVoxes");
const comment = require("../models/Comment");
const multer = require("multer");
const path = require("path");
const passport = require("passport");
const fs = require("fs");
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
  const { title, description, category}= req.body;
  const { filename }= req.file;
  const forwarded = req.headers['x-real-ip']
  const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
  console.log(ip);
  const errors = [];
  if(!title) {
    errors.push({text: "Titulo vacio"});
  }
  if(!description) {
    errors.push({text: "Descripcion vacia"});
  }
  if(!filename) {
    errors.push({text: "No subiste un archivo"});
  }
  if(!category) {
    errors.push({text: "No elegiste la categoria"});
  }
  if (errors.length > 0) {
    res.render("anuncios/allBoxs", {
      errors,
      title,
      filename,
      description,
      category,
      ip
    });

  } else {
    const newBox = new box({ title, description, filename, category, ip});
    await newBox.save();
    res.redirect("/");

  }
});

router.get("/", async (req, res) =>{
    const boxs = await box.find().sort({updatedDate: "desc", });
    res.render("anuncios/allBoxs", { boxs });
});

router.get("/voxCategory/:category", async (req, res) =>{
    const boxs = await box.find({category: req.params.category}).sort({updatedDate: "desc", });
    res.render("anuncios/allBoxs", { boxs });
});

router.get("/voxSearch/:title", async (req, res) =>{
  const s = req.params.title;
  const regex = new RegExp(s, 'i') // i for case insensitive
    const boxs = await box.find({title: {$regex: regex}}).sort({updatedDate: "desc", });
    res.render("anuncios/allBoxs", { boxs });
});

router.get("/admin", async (req, res) =>{
    const boxs = await box.find().sort({updatedDate: "desc", });
    res.render("anuncios/allBoxsAdminNew", { boxs });
});

//router.get("/anuncios/user", async (req, res) =>{
//    const boxsPropios = await box.find({user: req.user.id}).sort({date: "desc", });
//    await res.render("anuncios/allBoxs2", { boxsPropios });
//});

router.get("/vox/:id",async (req, res) => {
//  const forwarded = req.headers['x-real-ip']
//  const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
//  console.log(ip);
  try {
    const box2 = await box.findById(req.params.id);
    const filteredComment = await comment.find({image_id: req.params.id}).sort({date: "desc", });
//    const comment2 = comment.find({image_id:req.params.id})
//    console.log(comment2);
    res.render("anuncios/viewBox", { box2, filteredComment});
}
catch(error) {
    res.render("anuncios/viewBox", { error });
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
  console.log(box.filename)
  await unlink(path.resolve("./src/public/background/" + box.filename));
  const {title, description} = req.body;
  await box.findByIdAndUpdate(req.params.id, { title, description});
  res.redirect("/")
});
router.put("/updateCategory/:id", async (req, res) => {
  const category = req.body;
  const categorias = ["UFF", "POL", "GNR"];
  console.log(categorias);
  if (req.body.category === "Categoria") {
    res.redirect("/vox/" + req.params.id);
  } else {
    await box.findByIdAndUpdate(req.params.id, category);
    res.redirect("/vox/" + req.params.id);
  }

});
router.delete("/delete/:id", async (req, res) => {
  const box2 = await box.findById(req.params.id);
  var reason = req.body.reason;
  var idMod;
  if (req.isAuthenticated()) {     idMod = req.user._id;   }  else { idMod = "modgolico";    }
  var voxTitle = box2.title;
  const newDel = new deletedVox({idMod: idMod, reason: reason, voxTitle: voxTitle});
   await newDel.save();
  await fs.unlinkSync(path.resolve("./Voxer/src/public/backgrounds/" + box2.filename));
  await box.findByIdAndDelete(req.params.id);
  const commentDelt = await comment.find({image_id: req.params.id});
  commentDelt.forEach(async (item, i) => {
    var commentid = item._id;
    await comment.findByIdAndDelete(item._id);
  });

  res.redirect("/");
});

router.post("/vox/:id/comment", async(req, res) =>{
  const box2 = await box.findById(req.params.id);
  await box.findByIdAndUpdate({ _id: box2._id },
    { updatedDate: Date.now()});
  console.log(box2.updatedDate);
    if (box2) {
   const { comentario }= req.body;
   var name; if (req.isAuthenticated()) {//     const name = req.user.name;              Para tener el nombre de usuario    <------------
      name = "Anonimo";   }  else { name = "Anonimo";    }
   const image_id = req.params.id;
   console.log(image_id);
   var numero = Math.floor(Math.random() * 112) + 1;
   if (numero >= 1 && numero <= 25) {
     numero = "avatarColoryellow"
   }  else if (numero >= 26 && numero <= 50) {numero = "avatarColorred" }  else if (numero >= 51 && numero <= 75) {numero = "avatarColorgreen"}  else if (numero >= 76 && numero <= 100) {        numero = "avatarColorblue"  }  else if (numero >= 101 && numero <= 105) {        numero = "avatarColorMulti"  }  else if (numero == 106) {numero = "avatarColorBlack"  }  else if (numero == 107) {numero = "avatarColorWhite"  }else if (numero >= 108 && numero <= 112){  numero = "avatarColorInvertido"  }
   const newCommentt = new comment({name: name, comentario: comentario, image_id: image_id, numero: numero});
    await newCommentt.save();
    res.redirect("/vox/" + image_id);
  }

});


module.exports = router;
