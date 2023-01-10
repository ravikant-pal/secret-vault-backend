const express = require("express");
const router = express.Router();
const Key = require("../models/KeySchema");
const Value = require("../models/ValueSchema");
const CryptoJS = require("crypto-js");

router.post("/new", async (req, res) => {
  try {
    const key = await Key.findById(req.body.keyId).populate("values");
    const encryptedText = CryptoJS.AES.encrypt(
      req.body.value,
      process.env.SECRET_KEY
    ).toString();
    const savedValue = await Value.create({
      value: encryptedText,
    });
    key.values.unshift(savedValue._id);
    key.save();
    const bytes = CryptoJS.AES.decrypt(
      savedValue.value,
      process.env.SECRET_KEY
    );
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    savedValue.value = originalText;
    res.json(savedValue);
  } catch (err) {
    console.error(err.message);
    res.json({ message: err.message });
  }
});

router.delete("/:keyId/:valueId", async (req, res) => {
  try {
    const deletedValue = await Value.deleteOne({ _id: req.params.valueId });
    const result = await Key.updateOne(
      { _id: req.params.keyId },
      { $pull: { values: req.params.valueId } }
    );
    res.json(deletedValue);
  } catch (err) {
    console.error(err.message);
    res.json({ message: err });
  }
});

router.get("/test", async (req, res) => {
  // Encrypt
  var ciphertext = CryptoJS.AES.encrypt(
    "my message",
    process.env.SECRET_KEY
  ).toString();


  // Decrypt
  var bytes = CryptoJS.AES.decrypt(ciphertext, process.env.SECRET_KEY);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);

  res.json(originalText);
});

module.exports = router;
