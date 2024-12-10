import mongoose, { models } from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    balance: { 
        type: Number, 
        default: 100000, // Represents acutal balance * 100 (cents)
        min: 0,
    },
}, { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);

export default User;