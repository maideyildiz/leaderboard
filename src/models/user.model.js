const { UUID } = require("mongodb");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    id: UUID,
    email: String,
    score: Number,
    gameId:Number
});

module.exports = mongoose.model("Players", userSchema);