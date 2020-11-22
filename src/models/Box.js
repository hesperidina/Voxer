const mongoose = require("mongoose");
const { Schema } = mongoose;
const path = require("path");

const BoxSchema = new Schema ({
  title: { type: String, required: true},
  category: { type: String, required: true},
  filename: {type: String, required: true},
  description: { type: String, required: true},
  date: { type: Date, default: Date.now},
  updatedDate: { type: Date, default: Date.now, timestamps: true},
  user: { type: String}
});

module.exports = mongoose.model("Box", BoxSchema);
