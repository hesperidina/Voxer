const mongoose = require("mongoose");
const { Schema } = mongoose;
const path = require("path");
const CommentSchema = new Schema({
  image_id: { type: String },
  name: { type: String },
  comentario: { type: String, required: true},
  numero: { type: String },
  date: { type: Date, default: Date.now},
});
module.exports = mongoose.model("Comment", CommentSchema);
