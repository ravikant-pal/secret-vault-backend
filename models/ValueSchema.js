const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const ValueSchema = new Schema(
  {
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Values", ValueSchema);
