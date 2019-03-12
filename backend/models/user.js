const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: `^[\w.+\-]+@colorado\.edu$`
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  admin: Boolean
});

module.exports = mongoose.model("User", userSchema);
