const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: { type: String, required: true, minlength: 1, maxlength: 128 },
  content: { type: String, required: true, minlength: 50 },
  comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
  author: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  status: {
    type: String,
    enum: ["Published", "Unpublished"],
    default: "Published",
    required: true,
  },
  pub_date: { type: Date, default: Date.now },
});

blogSchema.virtual("url").get(function () {
  return `/blog/${this._id}`;
});

blogSchema.virtual("summary").get(function () {
  return this.content.slice(0, 40) + "...";
});

module.exports = mongoose.model("Blog", blogSchema);
