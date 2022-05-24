const express = require("express");
const router = express.Router();
const User = require("../models/UserSchema");
const otpService = require("../services/optService.js");

router.post("/send-otp", async (req, res) => {
  const otp = otpService.generateOtp();
  let user;
  User.findOne({ email: req.body.email }, async (err, dbUser) => {
    console.log("error : ", err, "Db user : ", dbUser);
    if (dbUser) {
      await User.updateOne(
        { _id: dbUser._id },
        { $set: { otp, otp_cdate: Date.now() } }
      );
      res.json({ userId: dbUser._id });
    } else {
      console.warn("User 404 : ", err);
      console.warn("Creating new user.");
      user = new User({
        email: req.body.email,
        otp,
      });

      user.save((err, user) => {
        if (!err) {
          res.json({ userId: user._id });
        } else {
          res.json({ message: err });
        }
      });
    }
  });
  otpService.sendOtp(
    req.body.email,
    otpService.getNameFromEmail(req.body.email),
    otp
  );
});

router.post("/verify-otp", async (req, res) => {
  const user = await User.findById(req.body.userId);
  console.warn(req.body);
  let expirationTime =
    new Date(user.otp_cdate.getTime() + 5 * 60000) > new Date();
  if (expirationTime && user.otp === req.body.otp) {
    const acknowladge = await User.updateOne(
      { _id: user._id },
      { $set: { ip: req.body.ip } }
    );
    console.debug(acknowladge);
    res.json({ ip: req.body.ip, verified: true });
  } else {
    res.status(401).json({ message: "Not a valid Otp" });
  }
});

module.exports = router;
