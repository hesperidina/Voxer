const mongoose = require("mongoose");
const { Schema } = mongoose;
const path = require("path");

const BoxSchema = new Schema ({
  idMod: { type: String, required: true },
  voxTitle: { type: String, required: true},
  reason: { type: String, required: true },
});

module.exports = mongoose.model("DeletedVoxes", BoxSchema);
