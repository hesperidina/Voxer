const mongoose = require("mongoose");
const { Schema } = mongoose;
const path = require("path");

const BoxSchema = new Schema ({
  name: { type: String },
  endDate: { type: Date, required: true},
  reason: { type: String, required: true},
  idMod: { type: String, required: true },
  ip: { type: String, required: true}
});

module.exports = mongoose.model("Blacklist", BoxSchema);
