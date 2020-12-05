const mongoose = require("mongoose");
const { Schema } = mongoose;
const path = require("path");
const CommentSchema = new Schema({
  image_id: { type: String },
  name: { type: String },
  comentario: { type: String, required: true},
  numero: { type: String, required: true },
  date: { type: Date, default: Date.now},
  tagId: { type: String, required: true },
  commentIp: { type: String, required: true },
  dado: {type: Number, default: 11, required: true}
});
module.exports = mongoose.model("Comment", CommentSchema);
