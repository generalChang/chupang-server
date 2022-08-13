const express = require("express");
const Comment = require("../models/Comment");
const router = express.Router();

router.post("/comments", (req, res) => {
  let { productId, skip, limit } = req.body;
  skip = skip ? parseInt(skip) : 0;
  limit = limit ? parseInt(limit) : 8;

  Comment.find({
    productId,
  })
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit)
    .populate("writer")
    .exec((err, comments) => {
      if (err) return res.send({ success: false, err });
      // return res.send({ success: true, comments });
      Comment.find({
        productId,
      })
        .sort({
          createdAt: -1,
        })
        .skip(skip + limit)
        .limit(limit)
        .exec((err, next) => {
          if (err) return res.send({ success: false, err });
          return res.send({
            success: true,
            comments: comments,
            isNext: next.length > 0,
          });
        });
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
