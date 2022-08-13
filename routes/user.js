const express = require("express");
const auth = require("../middlewares/auth");
const Product = require("../models/Product");
const User = require("../models/User");
const mailer = require("../modules/mailSender");

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
    passwordReset: req.user.passwordReset,
    username: req.user.username,
    email: req.user.email,
    gender: req.user.gender,
    image: req.user.image,
    cart: req.user.cart,
    history: req.user.history,
  });
});

router.get("/logout", auth, (req, res) => {
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

router.post("/resetPassword", (req, res) => {
  const { email } = req.body;
  const randomPlainPassword = Math.floor(Math.random() * 10 ** 8)
    .toString()
    .padStart("0", 8); ///아무 비밀번호나 만들어준뒤,

  User.getEncryptedPassword(randomPlainPassword, (err, encryptedPassword) => {
    if (err) return res.send({ success: false, err });
    User.findOneAndUpdate(
      {
        email,
      },
      {
        passwordReset: true,
        password: encryptedPassword,
      }
    ).exec((err, userInfo) => {
      if (err) return res.send({ success: false, err });

      mailer.sendGmail({
        toEmail: email,
        subject: "you reset your password!!!",
        text: `password : ${randomPlainPassword}`,
      });

      return res.send({ success: true });
    });
  });
});

router.post("/updatePassword", auth, (req, res) => {
  User.getEncryptedPassword(req.body.password, (err, encryptedPassword) => {
    if (err) return res.send({ success: false, err });
    User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      {
        passwordReset: false,
        password: encryptedPassword,
      }
    ).exec((err, userInfo) => {
      if (err) return res.send({ success: false, err });
      return res.send({ success: true });
    });
  });
});
router.post("/addToCart", auth, (req, res) => {
  //카트안에 추가한 상품이 이미 있따면? -> quentity만 올려준다.
  //있지 않다면? 필요한 상품정보를 주가해줘야한다.
  const { productId } = req.body;

  User.findOne({
    _id: req.user._id,
  }).exec((err, user) => {
    if (err) return res.send({ success: false, err });

    let duplicate = false;
    user.cart.forEach((item, index) => {
      if (item.id === productId) {
        duplicate = true;
      }
    });

    if (duplicate) {
      //이미 있다면?

      User.findOneAndUpdate(
        {
          _id: req.user._id,
          "cart.id": productId,
        },
        {
          $inc: {
            "cart.$.quentity": 1,
          },
        },
        { new: true }
      ).exec((err, userInfo) => {
        if (err) return res.send({ success: false, err });
        return res.send({ success: true, cart: userInfo.cart });
      });
    } else {
      User.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        {
          $push: {
            cart: {
              id: productId,
              quentity: 1,
              date: Date.now(),
            },
          },
        },
        { new: true }
      ).exec((err, userInfo) => {
        if (err) return res.send({ success: false, err });
        return res.send({ success: true, cart: userInfo.cart });
      });
    }
  });
});

router.get("/removeFromCart", auth, (req, res) => {
  User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $pull: {
        //카트필드에 있는 해당 id값을 갖는 녀석을 제거한다.
        cart: {
          id: req.query.productId,
        },
      },
    },
    { new: true }
  ).exec((err, userInfo) => {
    if (err) return res.send({ success: false, err });
    let cart = userInfo.cart;
    let array = cart.map((item, index) => {
      return item.id;
    });

    Product.find({
      _id: { $in: array },
    })
      .populate("writer")
      .exec((err, productInfo) => {
        if (err) return res.send({ success: false, err });
        return res.send({
          success: true,
          productInfo,
          cart,
        });
      });
  });
});

router.post("/successBuy", (req, res) => {
  ///user에 있는 cart를 비워준다.
  ///user history에 간단한 결제정보 넣어준다.
  ///payment에 상세 결제정보를 넣어줘야한다.
  ///product에 sold를 변경해줘야한다.

  let history = [];
  let transactionData = {};

  req.body.cartDetail.forEach((item, index) => {
    history.push({
      dateOfPurchase: Date.now(),
      name: item.title,
      id: item._id,
      price: item.price,
      quentity: item.quentity,
      paymentId: req.body.paymentData.paymentID,
    });
  });
});
module.exports = router;
