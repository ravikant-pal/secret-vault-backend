const express = require("express");
const router = express.Router();
const Key = require("../models/KeySchema");
const Value = require("../models/ValueSchema");

router.post("/new", async (req, res) => {
  try {
    const key = await Key.findById(req.body.keyId).populate("values");
    const savedValue = await Value.create({
      value: req.body.value,
    });
    key.values.unshift(savedValue._id);
    key.save();
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

module.exports = router;
