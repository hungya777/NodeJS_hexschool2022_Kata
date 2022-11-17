const mongoose = require("mongoose");

//建立schema
const roomSchema = new mongoose.Schema(
  {
    name: String,
    price: {
      type: Number,
      required: [true, "價格必填"]
    },
    rating: Number,
    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    }
  },
  {
    versionKey: false,
  }
)

// //建立model
const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
