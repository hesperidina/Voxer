const express = require("express");
const path = require("path");
const morgan = require("morgan");
const multer = require("multer");
const uuid = require("uuid");
const { format } = require("timeago.js");
//init
const app = express();
require("./database");
//setting
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//middleware
app.use(morgan("dev"));
app.use(express.urlencoded({extended: false}));
const storage = multer.diskStorage({
  destination: path.join(__dirname, "public/img/uploads"),
  filename: (req, file, cb, filename) => {
    cb(null, Date.now() + path.extname(file.originalname));

  }
});
app.use(multer({  storage: storage}).single("image"));

//globals
app.use((req, res, next) => {
  app.locals.format = format;
  next();
});
//routes
app.use(require("./routes/index"));
//static
app.use(express.static(path.join(__dirname, "public")));
//inicio del servidor
app.listen(app.get("port"), () => {
  console.log("Puerto: " + app.get("port"));
});
