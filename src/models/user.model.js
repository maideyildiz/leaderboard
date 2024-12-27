import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        required: [true, "Username is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    players: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Player"
        }
    ]
});

export default mongoose.model("User", userSchema);
