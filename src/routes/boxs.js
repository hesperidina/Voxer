const express = require("express");
const router = express.Router();
const box = require("../models/Box");
const app = express();
var geoip = require('geoip-country');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const extractFrames = require('ffmpeg-extract-frames')
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
var mapObj = {
   '\n>':"\n <b class='greentext'> >",
   '\r':"</b> \r",
};

function dado(){
  var numero = Math.floor(Math.random() * 112) + 1;
  if (numero >= 1 && numero <= 25) {
    numero = "avatarColoryellow"
  }  else if (numero >= 26 && numero <= 50) {numero = "avatarColorred" }  else if (numero >= 51 && numero <= 75) {numero = "avatarColorgreen"}  else if (numero >= 76 && numero <= 100) {        numero = "avatarColorblue"  }  else if (numero >= 101 && numero <= 105) {        numero = "avatarColorMulti"  }  else if (numero == 106) {numero = "avatarColorBlack"  }  else if (numero == 107) {numero = "avatarColorWhite"  }else if (numero >= 108 && numero <= 112){  numero = "avatarColorInvertido"  }
return numero;
}

function nl2br2(str){
var  str = str.replace(/((>>)[\w?=&.\/-;#~%-]+(?![\w?&.\/;#~%"=-]*>))/g, "<a href='#$1'  onmouseout='tagScriptOut$1()' onmouseover='tagScript$1()'> $1 </a>").replace(/#>>/g, '#').replace(/tagScript>>/g, 'tagScript').replace(/tagScriptOut>>/g, 'tagScriptOut').replace(/#http/g, 'http');
return str;
}
function nl2br(str){
var rgx = /(\n>)|(\r)/g;
var str =  str.replace(rgx, function(matched){
return mapObj[matched];
return str;
});
str = str.replace(/((\[)[\w?=&nbsp .\/-;#~%-]+(?![\w?&.\/;#~%"&nbsp=-]*>)(\]))/g, "<span class=hiddenText> $1 </span>");
str =  str.replace(/((>>)(http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w?&.\/;#~%"=-]*>))/g, "<a href='$1'> $1 </a>").replace(/href='>>/g, "href='").replace(/#http/g, 'http');;
str = str.replace(/(?:\r\n|\r)/g, '<br>');
return str;
}

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
})


router.post("/publicarAnuncio", multerUpload.single("imgUrl"), async (req, res) =>{
  var { title, description, category}= req.body;
  var videoUrl = req.body.videoUrl
  var video;
  var videoUrlVox;
  const errors = [];

if (req.file == undefined) {
  if (videoUrl != '') {
    const videoReplace= /^(https\:\/\/www.youtube.com\/watch\?v=)/g;
    videoUrlExport = videoUrl.replace(videoReplace, '');

      if (videoUrl == videoUrlExport) {
        errors.push({text: "El video no existe"})
    } else {
      var filename = videoUrlExport.substring(0, 11);
      var filenameCompressed = videoUrlExport.substring(0, 11);
      video = true;
      videoUrlVox = true;
    }
  }
}


 else {
   var { filename }= req.file;
   var filenameCompressed = filename;
    var extensionImg = filename.split('.').pop();
    console.log(extensionImg);
    if (extensionImg == 'jpg' | extensionImg ==  'png' | extensionImg ==  'gif' | extensionImg ==  'jpeg' ) {
      sharp(req.file.path).resize(275, 275).toFormat('jpeg').jpeg({quality: 40,}).toFile("src/public/backgrounds/compression" + req.file.filename, function(error) {
        console.log(error);
        var filenameCompressed = "compression" + filename;
      });
      video = false;
    } else if (extensionImg == 'webm' | extensionImg ==  'mp4') {
      video = true;
      var filenameCompressed = req.file.filename.toUpperCase().replace(/(.MP4)|(.WEBM)/g, '.jpg')
    await extractFrames({
        input: req.file.path,

        output: 'src/public/backgrounds/' + filenameCompressed,
        offsets: [
          1,
        ]
      })

    }
}

  const forwarded = req.headers['x-real-ip']
  const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
  const comments = 0;

  if(!title) {
    errors.push({text: "Titulo vacio"});
  }  else if(title.length > 50) {
      errors.push({text: "El titulo tiene que ser menor a 50 caracteres"});
    }
  if(!description) {
    errors.push({text: "Descripcion vacia"});
  }  else if(description.length > 3000) {
      errors.push({text: "La descripcion tiene que ser menor a 3000 caracteres"});
    }
  if(!filename) {
    errors.push({text: "No subiste un archivo"});
  }
  var categoriaBinario = 0;
  var arrayCategory = ["ANM", "ART", "AUR", "CIE", "CNJ", "CYTV", "DEP", "DES", "ECO", "GMR", "HISP", "HIS", "HMR", "HUM" , "INT", "ITA", "LIT", "LUG", "MUS", "NOT", "OFF", "OMN", "PAR", "POL", "PRG", "SMFG", "TEC", "UFF", "UMA", "WEBM", "YTB"]
  var categoria = category
  arrayCategory.forEach((item, i) => {
    if(item == categoria) {
    categoriaBinario = 1
    }
  });
  if(categoriaBinario == 0) {
    errors.push({text: "No elegiste la categoria"});
  }
  if (errors.length > 0) {
      var boxs = await box.find().sort({updatedDate: "desc", });
       res.render("anuncios/allBoxs", { boxs, errors });
  } else {
    description = '\n' + description + '\r'

    var descriptionFiltered =nl2br(description);
    var dados = false;
var re = new RegExp("<b class='greentext'> >dados</b>");

if (re.test(descriptionFiltered)) {
    dados = true;
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
  "SMFG" : "Samefag",
  "TEC" : "Tecnologia",
  "UFF" : "Random",
  "UMA" : "Gastronomia",
  "WEBM" : "WEBM",
  "YTB" : "Youtube",};


var flag;
var categoryFiltered = category.replace(category, function(matched){
  return categoryMap2[matched];
  });

  var geo = geoip.lookup(ip);
  if (geo == null) {
       flag = "ar";
     }
     else {
          flag = geo.country;
        }
    const newBox = new box({ title: title, comments: comments, description: descriptionFiltered, filename: filename, video: video, videoUrl: videoUrlVox, filenameCompressed: filenameCompressed, category: category, ip: ip, dados: dados, flag: flag, categoryFiltered: categoryFiltered});
    await newBox.save();
    res.redirect("/");

  }
});

router.get("/", async (req, res) =>{
   var boxs = await box.find().sort({updatedDate: "desc", });

    res.render("anuncios/allBoxs", { boxs });
});
router.get("/error", async (req, res) =>{
   var boxs = await box.find().sort({updatedDate: "desc", });
   var errors = []
   errors.push ({text: "Mail o contraseña incorrectos"});
    res.render("anuncios/allBoxs", { boxs, errors });
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
  try {
    const box2 = await box.findById(req.params.id);
    const filteredComment = await comment.find({image_id: req.params.id}).sort({date: "desc", });

filteredComment.forEach((item, i) => {
  filteredComment[i].date2 = moment(filteredComment[i].date).fromNow();
});


      box2.date2 = moment( box2.date).fromNow();


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


router.post("/vox/:id/comment", multerUpload.single("imgUrl2"), async(req, res) =>{
  const box2 = await box.findById(req.params.id);
  const comments = (box2.comments += 1);
console.log(req.body.imgUrl2);
console.log(req.file);
    if (box2) {



   var { comentario }= req.body;
   var comentario2 = req.body.comentario;
   var errors = [];
   var videoUrl = req.body.videoUrl
   var video;
   var videoUrlVox;
 if (req.file == undefined) {
   if (videoUrl != '') {
     const videoReplace= /^(https\:\/\/www.youtube.com\/watch\?v=)/g;
     videoUrlExport = videoUrl.replace(videoReplace, '');

       if (videoUrl == videoUrlExport) {
         errors.push({text: "El video no existe"})
     } else {
       var filename = videoUrlExport.substring(0, 11);
       var filenameCompressed = videoUrlExport.substring(0, 11);
       video = true;
       videoUrlVox = true;
     }
   }
 }

  else {
    var  filename = req.file.filename;
    var filenameCompressed = filename;
     var extensionImg = filename.split('.').pop();
     if (extensionImg == 'jpg' | extensionImg ==  'png' | extensionImg ==  'gif' | extensionImg ==  'jpeg' ) {
       video = false;
     } else if (extensionImg == 'webm' | extensionImg ==  'mp4') {
       video = true;
     }
 }
// Chequea si hay errores en el comentario ingresado

   if(!comentario2) {
     errors.push({text: "No ingresaste ningun texto"});
   }
   else if (comentario2.length > 1500) {
     errors.push({text: "Solo se permiten 1500 caracteres por comentarios"});
   }
   if (errors.length > 0) {
         const box2 = await box.findById(req.params.id);
         const filteredComment = await comment.find({image_id: req.params.id}).sort({date: "desc", });

           filteredComment.date2 = moment( filteredComment.date).fromNow();
           box2.date2 = moment( box2.date).fromNow();
         res.render("anuncios/viewBox", { box2, filteredComment, errors});
   }




// Si no hay errores entonces sube el comentario





   else {



     if (comments >= 700) {
       await box.findByIdAndUpdate({ _id: box2._id },
         { comments: comments});
     } else {
       await box.findByIdAndUpdate({ _id: box2._id },
         {updatedDate: Date.now(), comments: comments});
     }
     comentario2 = '\n' + comentario2 + '\r'
     var comentario=nl2br(comentario2);
         comentario = nl2br2(comentario);
     var name; if (req.isAuthenticated()) {//     const name = req.user.name;              Para tener el nombre de usuario    <------------
        name = "Anonimo";   }  else { name = "Anonimo";    }
     const image_id = req.params.id;
     var id = customId({});
     const forwarded = req.headers['x-real-ip']
     const commentIp = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
     var numero = dado();
     var flag;
       var geoComment = geoip.lookup(commentIp);
       if (geoComment == null) {
            flag = "ar";
          }
          else {
               flag = geoComment.country;
             }

if (!filename) {
  const newCommentt = new comment({name: name, comentario: comentario, image_id: image_id, numero: numero, tagId: id, commentIp: commentIp, dado: Math.floor(Math.random() * 10), flag: flag});
   await newCommentt.save();
} else {
  const newCommentt = new comment({filename: filename, video: video, videoUrl: videoUrlVox, name: name, comentario: comentario, image_id: image_id, numero: numero, tagId: id, commentIp: commentIp, dado: Math.floor(Math.random() * 10), flag: flag});
   await newCommentt.save();
}
      res.redirect("/vox/" + image_id);
   }
 } else {
   res.redirect("/");
 }

}

);


module.exports = router;
