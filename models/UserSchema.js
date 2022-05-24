const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  ip: {
    type: String,
    default: "",
  },
  otp: {
    type: String,
    minlength: 6,
    maxlength: 6,
  },
  otp_cdate: {
    type: Date,
    default: Date.now(),
  },
  keys: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Keys",
    },
  ],
  archived_date: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("Users", UserSchema);
