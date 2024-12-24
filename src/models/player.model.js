const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:[true,"Id is required"],
    },
    score:{
        type:Number,
        required:[true,"Score is required"]
    },
    gameId:{
        type:String,
        required:[true,"GameId is required"]
    }
});

module.exports = mongoose.model("Player", playerSchema);