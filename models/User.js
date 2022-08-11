const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

const saltRounds = 10;

const userSchema = mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  gender: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
  },
  role: {
    type: Number,
    default: 1,
  },
  cart: {
    type: Array,
    default: [],
  },
  history: {
    type: Array,
    default: [],
  },

  token: {
    type: String,
  },

  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  let user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  let user = this;
  bcrypt.compare(plainPassword, user.password, function (err, result) {
    // result == true
    if (err) return cb(err);
    return cb(null, result);
  });
};

userSchema.methods.generateToken = function (cb) {
  let user = this;
  let token = jwt.sign(user._id.toHexString(), "secret");

  user.token = token;
  user.save((err, userInfo) => {
    if (err) return cb(err);
    return cb(null, userInfo);
  });
};

userSchema.statics.findUserByToken = function (token, cb) {
  jwt.verify(token, "secret", function (err, decoded) {
    User.findOne({ _id: decoded, token: token }).exec((err, userInfo) => {
      if (err) return cb(err);
      return cb(null, userInfo);
    });
  });
};
const User = mongoose.model("User", userSchema);

module.exports = User;
