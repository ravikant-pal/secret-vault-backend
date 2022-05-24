const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const KeySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    is_secret: {
      type: Boolean,
      default: false,
    },
    values: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Values",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Keys", KeySchema);
