const User = require("../models/User");

const auth = (req, res, next) => {
  let token = req.cookies.x_auth; //쿠키에서 토큰 추출.

  User.findUserByToken(token, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.send({
        isAuth: false,
        error: true,
      });
    }

    req.user = user;
    req.token = token;
    next();
  });
};

module.exports = auth;
