import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  balance: number;
  lastRefilled: Date | null;
  netBalance: number;
}

const userSchema: Schema<IUser> = new mongoose.Schema<IUser>(
  {
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
      default: null,
    },
    netBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;