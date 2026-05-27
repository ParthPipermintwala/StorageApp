import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 180, // OTP expires after 3 minutes
    },
  },
  {
    strict: "throw",
    versionKey: false,
  }
);
otpSchema.index({ email: 1, otp: 1 });

const OTP=mongoose.model("OTP",otpSchema);
export default OTP;