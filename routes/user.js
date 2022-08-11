const express = require("express");
const auth = require("../middlewares/auth");
const User = require("../models/User");
const router = express.Router();

router.post("/register", (req, res) => {
  const user = new User(req.body);
  user.save((err, userInfo) => {
    if (err) return res.send({ success: false, err });
    return res.send({ success: true, userInfo });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  ///데이터베이스에서 해당 유저가 있는지 확인
  ///비밀번호가 매칭이 되는지 확인
  ///쿠키와 데이터베이스에 토큰생성 및 저장.

  User.findOne({
    email,
  }).exec((err, user) => {
    if (err) return res.send({ loginSuccess: false, err });
    if (!user)
      return res.send({ loginSuccess: false, message: "Email not found" });

    user.comparePassword(password, (err, isMatch) => {
      if (err) return res.send({ loginSuccess: false, err });
      if (!isMatch)
        return res.send({ loginSuccess: false, message: "Wrong password" });

      user.generateToken((err, userInfo) => {
        if (err) return res.send({ loginSuccess: false, err });
        res.cookie("x_auth", userInfo.token);
        return res.send({ loginSuccess: true, userId: userInfo._id });
      });
    });
  });
});

router.get("/auth", auth, (req, res) => {
  res.send({
    _id: req.user._id,
    isAdmin: req.user.role === 0,
    isAuth: true,
    username: req.user.username,
    email: req.user.email,
    gender: req.user.gender,
    image: req.user.image,
    cart: req.user.cart,
    history: req.user.history,
  });
});

router.get("/register", auth, (req, res) => {
  User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      token: "",
    }
  ).exec((err, userInfo) => {
    if (err) return res.send({ success: false, err });
    return res.send({ success: true });
  });
});
module.exports = router;
