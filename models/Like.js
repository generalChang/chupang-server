const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const likeSchema = mongoose.Schema({
  writer: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
  commentId: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
  },
});

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
