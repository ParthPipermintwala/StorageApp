import Directory from "../models/directoryModel.js";
import OTP from "../models/otpModel.js";
import User from "../models/userModel.js";
import createSession from "../services/sessionService.js";
import sendOtpMail from "../services/otpService.js";

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }
    const user = await User.findOne({ email }).select("_id").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await sendOtpMail(email);
    res.status(200).json({ message: `OTP sent successfully on ${email}` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select(
      "_id isVerified createdAt",
    );
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const otpRecord = await OTP.findOne({ email, otp }).select("_id");
    if (!otpRecord) {
      if (!user.isVerified && user.createdAt < Date.now() - 5 * 60 * 4000) {
        await user.deleteOne();
        await Directory.findOneAndDelete({ userId: user._id });
      }
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (!user.isVerified) {
      await user.updateOne({ isVerified: true });
    }
    await createSession(res, req, user._id);
    await otpRecord.deleteOne();
    res.status(200).json({ message: "OTP Verified Successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
