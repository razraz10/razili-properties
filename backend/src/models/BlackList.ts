import mongoose from "mongoose";

const BlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" } // נמחק אוטומטית אחרי שבוע
});

export default mongoose.model("Blacklist", BlacklistSchema);
