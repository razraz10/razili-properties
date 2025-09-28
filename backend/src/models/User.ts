import mongoose, { Document, Schema } from "mongoose";


export interface IUser extends Document {
    user_name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    favorites: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
    {
        user_name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "property" }],

    },
    {timestamps: true}
)

export const User = mongoose.model<IUser>("User", userSchema)