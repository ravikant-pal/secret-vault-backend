const express = require("express");
const router = express.Router();
const User = require("../models/UserSchema");
const otpService = require("../services/otpService");
const jwt = require("jsonwebtoken");
require("dotenv/config");

router.post("/send-otp", async (req, res) => {
  const otp = otpService.generateOtp();
  let user;
  User.findOne({ email: req.body.email }, async (err, dbUser) => {
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
          //todo:: security :: do not send userId in response insted send in httpOnly coockie.
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
    // create JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    // Saving Refresh token with IP address to current user
    await User.updateOne(
      { _id: user._id },
      { $set: { refreshToken } }
    );
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({verified: true, accessToken });
  } else {
    res.status(400).json({ message: "Not a valid Otp" });
  }
});

router.get("/refresh", async (req, res) => {
  const coockie = req.cookies;
  if (!coockie?.jwt) return res.sendStatus(401);
  const refreshToken = coockie.jwt;
  const user = await User.findOne({ refreshToken });
  if (!user) return res.sendStatus(403); //forbidden

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || user?._id?.toString() !== decoded.userId)
      return res.sendStatus(403);
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    res.json({ accessToken });
  });
});

router.get("/logout", async (req, res) => {
  // on Client also delete the accessToken
  const coockie = req.cookies;
  if (!coockie?.jwt) return res.sendStatus(204); //No content
  const refreshToken = coockie.jwt;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res.sendStatus(204);
  }
  // delete the referesh token from the DB
  await User.updateOne({ _id: user._id }, { $set: { refreshToken: "" } });
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  return res.sendStatus(204);
});

module.exports = router;
