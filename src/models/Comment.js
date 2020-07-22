const { Schema, model} = require("mongoose");
const ObjectId = Schema.ObjectId;

const CommentSchema = new Schema({
  image_id: { type: ObjectId },
  name: { type: String },
  comentario: { type: String },
//  gravatar: { type: String},
  timestamp: { type: Date, default: Date.now }
});

module.export = model("Comment", CommentSchema);
