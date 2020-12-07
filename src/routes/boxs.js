const express = require("express");
const router = express.Router();
const box = require("../models/Box");
const app = express();
var geoip = require('geoip-country');
var ffmpeg = require('ffmpeg');
//const io = require('socket.io').listen(8001);
const users = require("../models/users");
const deletedVox = require("../models/DeletedVoxes");
const blacklist = require("../models/Blacklist");
const comment = require("../models/Comment");
const multer = require("multer");
const path = require("path");
var customId = require("custom-id");
const passport = require("passport");
const fs = require("fs");
const sharp = require('sharp');
const moment = require("moment");
moment.locale('es');



const storage = multer.diskStorage({
  destination :path.join(__dirname, "../public/backgrounds"),
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
  var { title, description, category}= req.body;

  var videoUrl = req.body.videoUrl
  var video;
  var videoUrlVox
if (req.file == undefined) {
  if (videoUrl != '') {
    const videoReplace= /^(https\:\/\/www.youtube.com\/watch\?v=)/g;
    videoUrlExport = videoUrl.replace(videoReplace, '');
    console.log(videoUrlExport);
    filename = 'https://www.youtube.com/embed/' + videoUrlExport;
    video = true;
    videoUrlVox = true;
      if (videoUrl == videoUrlExport) {
      console.log("Error en la subida");
    } else {
      console.log("Video subido")
    }
  } else {}
}


 else {
    var { filename }= req.file;
    var extensionImg = filename.split('.').pop();
    if (extensionImg == 'jpg' | 'png' | 'gif' | 'jpeg' ) {
      sharp(req.file.path).resize(275, 275).toFormat('jpeg').jpeg({quality: 40,}).toFile("src/public/backgrounds/compression" + req.file.filename, function(error) {
        console.log(error);
      });
      video = false;
    } else if (extensionImg == 'webm' | 'mp4') {
      video = true;
    }
}
console.log(filename);




  const forwarded = req.headers['x-real-ip']
  const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
  const comments = 0;
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
      errors,  title,    filename,  description,    category,    ip,    comments  });
  } else {

    description = '\n' + description + '\r'
    var mapObj = {
       '\n>':"\n <b class='greentext'> >",
       '\r':"</b> \r",
    };

       function nl2br(str){
    var rgx = /(\n>)|(\r)/g;
    var str =  str.replace(rgx, function(matched){
      return mapObj[matched];
      return str;
    });
     var str =  str.replace(/((>>)(http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w?&.\/;#~%"=-]*>))/g, "<a href='$1'> $1 </a>").replace(/href='>>/g, "href='").replace(/#http/g, 'http');;

       str = str.replace(/(?:\r\n|\r)/g, '<br>');
     return str;
    }
    var descriptionFiltered =nl2br(description);
    var dados = false;
var re = new RegExp("<b class='greentext'> >dados</b>");

if (re.test(descriptionFiltered)) {
    dados = true;
}

console.log(video);
console.log(filename);


var filenameCompressed = "compression" + filename;

    const newBox = new box({ title: title, comments: comments, description: descriptionFiltered, filename: filename, video: video, videoUrl: videoUrlVox, filenameCompressed: filenameCompressed, category: category, ip: ip, dados: dados});
    await newBox.save();
    res.redirect("/");

  }
});

router.get("/", async (req, res) =>{
   var boxs = await box.find().sort({updatedDate: "desc", });
   boxs.forEach((boxs, i) => {
     boxs.date2 = moment( boxs.date).fromNow();
   });
    res.render("anuncios/allBoxs", { boxs });


    //ffmpeg -ss "$screenshot_time" -i $(youtube-dl -f 22 --get-url "$youtube_url") -vframes 1 -q:v 2 "$output_file"
});

router.get("/voxCategory/:category", async (req, res) =>{
    const boxs = await box.find({category: req.params.category}).sort({updatedDate: "desc", });


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
  try {
    const box2 = await box.findById(req.params.id);
    const filteredComment = await comment.find({image_id: req.params.id}).sort({date: "desc", });





      var ip = box2.ip;
      var geo = geoip.lookup(ip);
      if (geo == null) {
           box2.flag = "ar";
         }
         else {
              box2.flag = geo.country;
            }

 var categoryMap2 = {
   "ANM" : "Anime",
   "ART" : "ART",
   "AUT" : "Autos",
   "CIE" : "Ciencia",
   "CNJ" : "Consejos",
   "CYTV" : "Cine Y TV",
   "DEP" : "Deportes",
   "DES" : "Descargas",
   "ECO" : "Economia",
   "GMR" : "Juegos",
   "HIS" : "Hispanos",
   "HIS" : "Historias",
   "HMR" : "Humor",
   "HUM" : "Humanidades",
   "INT" : "Internacional",
   "ITA" : "Italiani",
   "LIT" : "Literatura",
   "LUG" : "Lugares",
   "MUS" : "Musica",
   "NOT" : "Noticias",
   "OFF" : "General",
   "OMN" : "Omniverso",
   "PAR" : "Paranormal",
   "POL" : "Politica",
   "PRG" : "Preguntas",
   "PRG" : "Preguntas",
   "SMFG" : "Samefag",
   "TEC" : "Tecnologia",
   "UFF" : "Random",
   "UMA" : "Gastronomia",
   "WEBM" : "WEBM",
   "YTB" : "Youtube",};

box2.categoryFiltered = box2.category.replace(box2.category, function(matched){
   return categoryMap2[matched];
   });
      box2.date2 = moment( box2.date).fromNow();

    filteredComment.forEach((filteredComment, i) => {
      var ipComment = filteredComment.commentIp;
      var geoComment = geoip.lookup(ipComment);
      if (geoComment == null) {
           filteredComment.flag = "ar";
           console.log(geoComment);
         }
         else {
              filteredComment.flag = geoComment.country;
              console.log(geoComment.country);

            }
            filteredComment.date2 = moment( filteredComment.date).fromNow();
  });
// ====> tengo que poner las banderas y categorias directamente en la DB


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
  await unlink(path.resolve("./src/public/background/" + box.filename));
  const {title, description} = req.body;
  await box.findByIdAndUpdate(req.params.id, { title, description});
  res.redirect("/")
});
router.put("/updateCategory/:id", async (req, res) => {
  const category = req.body;
  const categorias = ["UFF", "POL", "GNR"];
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
  var type = req.body.type
  var idMod;
  if (type == "delete") {
    if (req.isAuthenticated()) {     idMod = req.user._id;   }  else { idMod = "modgolico";    }
    var voxTitle = box2.title;
    const newDel = new deletedVox({idMod: idMod, reason: reason, voxTitle: voxTitle});
     await newDel.save();
    await fs.unlinkSync(path.resolve("src/public/backgrounds/" + box2.filename));
    await box.findByIdAndDelete(req.params.id);
    const commentDelt = await comment.find({image_id: req.params.id});
    commentDelt.forEach(async (item, i) => {
      var commentid = item._id;
      await comment.findByIdAndDelete(item._id);
    });
  } else if (type == "ban") {
    if (req.isAuthenticated()) {     idMod = req.user._id;   }  else { idMod = "modgolico";    }
    var ip = box2.ip;
    var voxTitle = box2.title;
    const newDel = new deletedVox({idMod: idMod, reason: reason, voxTitle: voxTitle});
     await newDel.save();
    const newBan = new blacklist({idMod: idMod, reason: reason, ip: ip});
     await newBan.save();
    await fs.unlinkSync(path.resolve("src/public/backgrounds/" + box2.filename));
    await box.findByIdAndDelete(req.params.id);
    const commentDelt = await comment.find({image_id: req.params.id});
    commentDelt.forEach(async (item, i) => {
      var commentid = item._id;
      await comment.findByIdAndDelete(item._id);
    });
  }

  res.redirect("/");
});

router.get("/vox/:id/comment/img/:filename", async (req, res) =>{
    const boxs = await box.findById(req.params.id);
    res.render("anuncios/imageView", { boxs });
});


router.post("/vox/:id/comment", async(req, res) =>{
  const box2 = await box.findById(req.params.id);
  const comments = (box2.comments += 1);

if (comments >= 700) {
  await box.findByIdAndUpdate({ _id: box2._id },
    { comments: comments});
} else {
  await box.findByIdAndUpdate({ _id: box2._id },
    {updatedDate: Date.now(), comments: comments});
}

    if (box2) {
   var { comentario }= req.body;
   var comentario2 = req.body.comentario;
   comentario2 = '\n' + comentario2 + '\r'


   var mapObj = {
      '\n>':"\n <b class='greentext'> >",
      '\r':"</b> \r",
   };

      function nl2br(str){
   var rgx = /(\n>)|(\r)/g;
   var str =  str.replace(rgx, function(matched){
     return mapObj[matched];
     return str;
   });
    var str =  str.replace(/((>>)(http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w?&.\/;#~%"=-]*>))/g, "<a href='$1'> $1 </a>").replace(/href='>>/g, "href='");
       str = str.replace(/((>>)[\w?=&.\/-;#~%-]+(?![\w?&.\/;#~%"=-]*>))/g, "<a href='#$1'  onmouseout='tagScriptOut$1()' onmouseover='tagScript$1()'> $1 </a>").replace(/#>>/g, '#').replace(/tagScript>>/g, 'tagScript').replace(/tagScriptOut>>/g, 'tagScriptOut').replace(/#http/g, 'http');
      str = str.replace(/(?:\r\n|\r)/g, '<br>');
    return str;
   }
   var comentario=nl2br(comentario2);
   var name; if (req.isAuthenticated()) {//     const name = req.user.name;              Para tener el nombre de usuario    <------------
      name = "Anonimo";   }  else { name = "Anonimo";    }
   const image_id = req.params.id;

   var numero = Math.floor(Math.random() * 112) + 1;
   if (numero >= 1 && numero <= 25) {
     numero = "avatarColoryellow"
   }  else if (numero >= 26 && numero <= 50) {numero = "avatarColorred" }  else if (numero >= 51 && numero <= 75) {numero = "avatarColorgreen"}  else if (numero >= 76 && numero <= 100) {        numero = "avatarColorblue"  }  else if (numero >= 101 && numero <= 105) {        numero = "avatarColorMulti"  }  else if (numero == 106) {numero = "avatarColorBlack"  }  else if (numero == 107) {numero = "avatarColorWhite"  }else if (numero >= 108 && numero <= 112){  numero = "avatarColorInvertido"  }
   var id = customId({});
   var commentOp = false;
   const forwarded = req.headers['x-real-ip']
   const commentIp = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
   if (box2.ip = commentIp) {
     commentOp = true
   }

    var dados = Math.floor(Math.random() * 10);

   const newCommentt = new comment({name: name, comentario: comentario, image_id: image_id, numero: numero, tagId: id, commentIp: commentIp, commentOp: commentOp, dado: dados});
    await newCommentt.save();

    res.redirect("/vox/" + image_id);
  }

});


module.exports = router;
