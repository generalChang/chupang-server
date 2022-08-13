const express = require("express");
const auth = require("../middlewares/auth");
const Like = require("../models/Like");
const router = express.Router();

router.post("/likes", (req, res) => {
  const { productId } = req.body;
  Like.find({
    productId,
  }).exec((err, likes) => {
    if (err) return res.send({ success: false, err });
    return res.send({ success: true, likes, likesCount: likes.length });
  });
});

router.post("/uplike", auth, (req, res) => {
  req.body.writer = req.user._id;
  const like = new Like(req.body);
  like.save((err, likeInfo) => {
    if (err) res.send({ success: false, err });
    return res.send({ success: true });
  });
});

router.post("/unlike", auth, (req, res) => {
  req.body.writer = req.user._id;
  const { productId, writer } = req.body;
  Like.findOneAndRemove({
    productId,
    writer,
  }).exec((err, likeInfo) => {
    if (err) res.send({ success: false, err });
    return res.send({ success: true });
  });
});

module.exports = router;
