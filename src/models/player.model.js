import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
    gameId:{
        type:String,
        required:[true,"GameId is required"]
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    score:{
        type:Number,
        required:[true,"Score is required"]
    }
});

export default mongoose.model("Player", playerSchema);