import mongoose, { Types } from "mongoose";
import Directory from "../models/directoryModel.js";
import User from "../models/userModel.js";

const createUser = async function (userData) {
 const session = await mongoose.startSession();
  try {
    const userId = new Types.ObjectId();
    const rootDirId = new Types.ObjectId();
    await session.startTransaction();
    //Creating Root Directory for User
    await Directory.create([{ _id: rootDirId, userId }], { session });
    //Creating User
    await User.create([{ _id: userId, ...userData, rootDirId }], {
      session,
    });
    await session.commitTransaction();
    return userId;
  } catch (err) {
    await session.abortTransaction();
     throw err;
  } finally {
    await session.endSession();
  }
};

export default createUser;