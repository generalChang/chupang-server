const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middlewares/auth");
const Product = require("../models/Product");

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext == ".png" || ex == ".jpg" || ext == ".jpeg" || ext == ".gif") {
    cb(null, true);
  } else {
    cb({ msg: "only png, jpg, jpeg, gif allowed!!!" }, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single("file");

router.post("/image", (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.send({ success: false, err });
    return res.send({
      success: true,
      url: req.file.path, //이게 젤중요. 파일의 path값을 얻어낸다.
      filename: req.file.filename,
    });
  });
});

router.post("/upload", auth, (req, res) => {
  const product = new Product(req.body);
  product.save((err, productInfo) => {
    if (err) return res.send({ success: false, err });
    return res.send({ success: true, productInfo });
  });
});

router.post("/products", (req, res) => {
  Product.find()
    .populate("writer")
    .exec((err, products) => {
      if (err) return res.send({ success: false, err });
      return res.send({ success: true, products });
    });
});
module.exports = router;
