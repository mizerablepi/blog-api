const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: { type: String, required: true, minlength: 1 },
  author: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  pub_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", commentSchema);
