import User from "../models/userModel.js";
import createUser from "../services/userService.js";
import { verifyGoogleToken } from "../services/googleAuthService.js";
import {
  createSession,
  deleteAllSessions,
  deleteSession,
  limitSessions,
} from "../services/sessionService.js";

//serve user data
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.user;
    const userData = await User.findById(userId)
      .select("-password -rootDirId -isVerified")
      .lean();
    if (!userData) {
      return res.status(404).json({ message: "User Not Found" });
    }
    return res.status(200).json({ user: userData });
  } catch (err) {
    console.error("Get user data error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//User creation
export const signup = async (req, res) => {
  try {
    await createUser(req.body);
    res
      .status(201)
      .json({ message: "Account Created Successfully.Verify Your Email." });
  } catch (err) {
    console.error("Signup error:", err);
    //MongoDB Validation Error Code
    if (err.code === 121) {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000 && err.keyValue.email) {
      return res.status(400).json({ message: "Email Already Exists" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//User login
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select(
      "password _id  isTwoFactorEnabled",
    );
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    if (user.isTwoFactorEnabled) {
      return res.status(200).json({
        requires2FA: true,
      });
    }

    await limitSessions(user._id);
    await createSession(req, res, user._id);

    res.status(200).json({ message: "Login Successful" });
  } catch (err) {
    console.error("Signin error:", err);
    //MongoDB Validation Error Code
    if (err.code === 121) {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000 && err.keyValue.email) {
      return res.status(400).json({ message: "Email Already Exists" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    const googleUser = await verifyGoogleToken(idToken);
    const { name, email } = googleUser;
    const existingUser = await User.findOne({ email })
      .select("_id isVerified isTwoFactorEnabled")
      .lean();
    if (!existingUser) {
      const userId = await createUser({ name, email, isVerified: true });
      await createSession(req, res, userId);
      return res.status(200).json({ message: "Login Successful" });
    }
    if (!existingUser.isVerified) {
      await User.updateOne(
        { _id: existingUser._id },
        { $set: { isVerified: true } },
      );
    }
    if (existingUser.isTwoFactorEnabled) {
      return res.status(200).json({
        requires2FA: true,
      });
    }
    await limitSessions(existingUser._id);
    await createSession(req, res, existingUser._id);
    res.status(200).json({ message: "Login Successful" });
  } catch (err) {
    console.log(err);
    //MongoDB Validation Error Code
    if (err.code === 121) {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000 && err.keyValue.email) {
      return res.status(400).json({ message: "Email Already Exists" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//User Logout
export const logout = async (req, res) => {
  try {
    const sid = req.signedCookies.sid;
    await deleteSession(sid);
    res.clearCookie("sid", {
      httpOnly: true,
      signed: true,
    });
    res.status(200).json({ message: "User Logged Out Successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//User Logout from All Devices
export const logoutAll = async (req, res) => {
  try {
    const sid = req.signedCookies.sid;
    await deleteAllSessions(sid);
    res.clearCookie("sid", {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
    });
    res.status(200).json({ message: "User Logged Out Successfully" });
  } catch (err) {
    console.error("Logout all error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
