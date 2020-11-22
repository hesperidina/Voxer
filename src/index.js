const express = require ("express");
const path = require("path");
const handlebars = require ("handlebars");
const {allowInsecurePrototypeAccess} = require ("@handlebars/allow-prototype-Access");
const expresshandlebars = require ("express-handlebars");
const methodOverride = require("method-override");
const session = require ("express-session");
const passport = require ("passport");
const { format } = require("timeago.js");
const SocketIO = require("socket.io");

const multer = require("multer");
const storage = multer.diskStorage({
  destination:path.join(__dirname, "public/uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
//init
const app = express();
require("./database");

require("./config/passport");


//Settings
app.set("port", process.env.PORT || 3000)
app.set("views", path.join(__dirname, "views"))
app.engine(".hbs", expresshandlebars({
  handlebars:
  allowInsecurePrototypeAccess(handlebars),
  defaultLayout: "main",
  layoutDir: path.join(app.get("views"), "layouts"),
  partialsDir: path.join(app.get("views"), "partials"),
  extname: ".hbs"
}));

app.set("view engine", ".hbs");
//Middlewares
app.use(express.urlencoded({extended: false}));
app.use(methodOverride("_method"));
app.use(session({
  secret: "menemycavallo",
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

//Variables globales
app.use((req, res, next) => {
  app.locals.format = format;
  next();
});
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//Rutas
app.use(require("./routes/index"));
app.use(require("./routes/boxs"));
app.use(require("./routes/users"));
app.post("/uploads", (req, res) => {
  res.send("uploaded");
});
//static files
app.use(express.static(path.join(__dirname, "public")));



//Server init
const server = app.listen(app.get("port"), () => {
  console.log("Puerto: ", app.get("port"))
});
const io = SocketIO(server);
//SocketIO
io.on("connection", (socket) => {

  socket.on("chat:message", (data) => {
    console.log(data);
    io.sockets.emit("chat:message", data);
  })
});
