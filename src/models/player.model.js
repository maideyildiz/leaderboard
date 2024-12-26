import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:[true,"Id is required"],
    },
    userName:{
        type:String,
        unique:true
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

export default mongoose.model("Player", playerSchema);