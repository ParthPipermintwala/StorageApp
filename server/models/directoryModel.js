import mongoose, { Schema } from "mongoose";

const directorySchema = new Schema(
  {
    name: {
      type: String,
      minLength: [3, "Name must be at least 3 characters"],
      maxLength: [255, "Name cannot exceed 255 characters"],
      default: "root",
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
  },
  { strict: "throw", timestamps: true },
);

const Directory = mongoose.model("Directory", directorySchema);
export default Directory;
