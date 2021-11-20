const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  const tokenSent = req.headers.authorization.replace("Bearer ", "");
  const user = await User.findOne({ token: tokenSent });
  if (user) {
    console.log("client authorized");;
    next();
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = isAuthenticated;
