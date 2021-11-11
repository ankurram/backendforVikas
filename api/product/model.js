const mongoose = require("mongoose");
const tripSchema = new mongoose.Schema(
    {
         tripName: { type: String, default: "Null" },
         location: { type: String, default: "Null" },
         price:{type: Number, default:0},
         createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
    },
    {
         timestamps: true,
    }
)
    var trip = mongoose.model("trip", tripSchema);
module.exports = trip;