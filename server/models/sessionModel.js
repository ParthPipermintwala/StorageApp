import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      ref: "User",
      immutable: true,
      index: true,
    },
    ip:{
      type: String,
      required: [true, "IP Address is required"],
      immutable: true,
    },
    userAgent: {
      type: String,
      required: [true, "User Agent is required"],
      immutable: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 15,
      immutable: true,
    },
  },
  { strict: "throw", versionKey: false },
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
