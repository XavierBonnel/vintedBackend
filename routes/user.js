const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encbase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

// const { findOne } = require("../models/User");

const cloudinary = require("cloudinary").v2;



router.post("/user/signup", async (req, res) => {
  try {
    const avatar = req.files.avatar.path;
    const email = req.fields.email;
    const username = req.fields.username;
    const phone = req.fields.phone;
    const password = req.fields.password;

    const imageCloud = await cloudinary.uploader.upload(avatar, {
      folder: "/vinted/users/",
    });

    if (username) {
      const user = await User.findOne({ email: email });
      if (!user) {
        const salt = uid2(64);
        const hash = SHA256(password + salt).toString(encbase64);
        const token = uid2(64);

        const newUser = new User({
          email: email,
          account: {
            username: username,
            phone: phone,
            avatar: imageCloud.secure_url,
          },
          token: token,
          salt: salt,
          hash: hash,
        });
        await newUser.save();
        res.status(200).json({
          _id: newUser._id,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(409).json({ message: "This email already has an account" });
      }
    } else {
      res.status(400).json({ message: "Missing username parameter" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    if (user) {
      console.log("Le hash du user dans la BDD est : ", user.hash);
      const newHash = SHA256(req.fields.password + user.salt).toString(
        encbase64
      );
      console.log("Le nouveau hash est :", newHash);
      if (newHash === user.hash) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


module.exports = router;
