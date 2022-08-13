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
  const limit = req.body.limit ? parseInt(req.body.limit) : 8;
  const skip = req.body.skip ? parseInt(req.body.skip) : 0;
  const searchText = req.body.searchText ? req.body.searchText : "";
  let findArgs = {};

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(findArgs)
    .find({
      title: {
        $regex: searchText,
      },
    })
    .skip(skip)
    .limit(limit)
    .populate("writer")
    .exec((err, products) => {
      if (err) return res.send({ success: false, err });
      // return res.send({ success: true, products });

      Product.find(findArgs)
        .find({
          title: {
            $regex: searchText,
          },
        })
        .skip(skip + limit)
        .limit(limit)
        .exec((err, next) => {
          if (err) return res.send({ success: false, err });
          return res.send({
            success: true,
            products,
            postSize: products.length,
            isNext: next.length > 0,
          });
        });
    });
});

router.get("/productById", (req, res) => {
  const type = req.query.type;
  let productId = req.query.id;

  if (type === "array") {
    let newIds = productId.split(",");
    productId = newIds.map((item, index) => {
      return item;
    });
  }
  Product.find({
    _id: {
      $in: productId,
    },
  })
    .populate("writer")
    .exec((err, products) => {
      if (err) return res.send({ success: false, err });
      return res.send({ success: true, products });
    });
});
module.exports = router;
