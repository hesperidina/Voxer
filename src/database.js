const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://@cluster0.u24ku.mongodb.net/voxer?retryWrites=true&w=majority", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
})

.then(db => console.log("DB Conectado"))
.catch(err => console.error(err));
