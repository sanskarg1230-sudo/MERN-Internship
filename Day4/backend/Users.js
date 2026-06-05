const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      min: 1,
    },
    isActive: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);