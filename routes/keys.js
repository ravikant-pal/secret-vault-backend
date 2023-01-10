const express = require("express");
const router = express.Router();
const Key = require("../models/KeySchema");
const User = require("../models/UserSchema");
const CryptoJS = require("crypto-js");

router.get("/all/:userId", async (req, res) => {
  try {
    const keys = await User.findById(req.params.userId)
      .populate("keys")
      .select("keys");
    res.json(keys);
  } catch (err) {
    console.error(err.message);
    res.json({ message: err.message });
  }
});

router.post("/new", async (req, res) => {
  try {
    const user = await User.findById(req.body.userId).populate("keys");
    const savedkey = await Key.create({
      name: req.body.name,
    });
    user.keys.unshift(savedkey._id);
    user.save();
    res.json(savedkey);
  } catch (err) {
    console.error(err.message);
    res.json({ message: err.message });
  }
});

router.get("/:keyId", async (req, res) => {
  try {
    let key = await Key.findById(req.params.keyId).populate("values");
    let decriptedValues = key.values.map((val) => {
      const bytes = CryptoJS.AES.decrypt(val.value, process.env.SECRET_KEY);
      const originalValue = bytes.toString(CryptoJS.enc.Utf8);
      return {
        _id: val._id,
        value: originalValue,
        createdAt: val.createdAt,
        updatedAt: val.updatedAt,
      };
    });

    res.json({
      _id: key._id,
      name: key.name,
      is_secret: key.is_secret,
      values: decriptedValues,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    });
  } catch (err) {
    console.error(err.message);
    res.json({ message: err.message });
  }
});

router.patch("/make-secret/:keyId", async (req, res) => {
  try {
    const acknowladge = await Key.updateOne(
      { _id: req.params.keyId },
      { $set: { is_secret: true } }
    );
    res.status(204).json(acknowladge);
  } catch (err) {
    console.error(err.message);
    res.json({ message: err.message });
  }
});

router.delete("/:userId/:keyId", async (req, res) => {
  try {
    const acknowladge = await Key.deleteOne({ _id: req.params.keyId });
    const result = await User.updateOne(
      { _id: req.params.userId },
      { $pull: { keys: req.params.keyId } }
    );
    res.status(204).json(acknowladge);
  } catch (err) {
    console.error(err.message);
    res.json({ message: err });
  }
});

module.exports = router;
