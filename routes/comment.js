const express = require("express");
const Comment = require("../models/Comment");
const router = express.Router();

router.post("/comments", (req, res) => {
  const { productId } = req.body;

  Comment.find({
    productId,
  })
    .populate("writer")
    .exec((err, comments) => {
      if (err) return res.send({ success: false, err });
      return res.send({ success: true, comments });
    });
});

router.post("/writeComment", (req, res) => {
  const comment = new Comment(req.body);

  comment.save((err, commentInfo) => {
    if (err) return res.send({ success: false, err });
    return res.send({ success: true, commentInfo });
  });
});

module.exports = router;
