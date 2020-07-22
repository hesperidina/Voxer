const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/venditio-db-app", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
})

.then(db => console.log("DB Conectado"))
.catch(err => console.error(err));
