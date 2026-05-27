import mongoose, { Schema } from "mongoose";

const fileSchema = new Schema(
  {
    dirId: {
      type: Schema.Types.ObjectId,
      required: [true, "Directory is required"],
      ref: "Directory",
    },
    extension: {
      type: String,
      required: [true, "Extension is required"],
    },
    name: {
      type: String,
      default: "untitled",
    },
    size: {
      type: Number,
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User is required"],
      ref: "User",
    },
  },
  { strict: "throw", timestamps: true },
);

const File = mongoose.model("File", fileSchema);
export default File;
