const mongoose = require("mongoose");
const { Schema } = mongoose;
const path = require("path");

const BoxSchema = new Schema ({
  title: { type: String, required: true},
  category: { type: String, required: true},
  filename: {type: String, required: true},
  video: {type: Boolean, default: false, required: true},
  videoUrl: {type: Boolean, default: false, required: true},
  filenameCompressed: {type: String},
  description: { type: String, required: true},
  date: { type: Date, default: Date.now},
  updatedDate: { type: Date, default: Date.now, timestamps: true},
  user: { type: String},
  ip: { type: String, required: true},
  flag: { type: String, required: true},
  categoryFiltered: { type: String, required: true},
  comments: { type: Number, required: true},
  dados: { type: Boolean, default: false, required: true}
});

module.exports = mongoose.model("Box", BoxSchema);
