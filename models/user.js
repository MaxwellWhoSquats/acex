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
        default: 0,
        min: 0,
    },
    lastRefilled: {
        type: Date,
        default: null
    },
    netBalance: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const User = models.User || mongoose.model("User", userSchema);
export default User;
