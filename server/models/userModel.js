import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        "Please fill a valid email address",
      ],
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      minLength: [3, "Name must be at least 3 characters"],
      maxLength: [100, "Name cannot exceed 100 characters"],
      required: [true, "Name is required"],
      trim: true,
    },
    password: {
      type: String,
      // match: [
      //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      //   "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters. e.g., Password123!",
      // ],
    },
    rootDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      required: [true, "Root directory is required"],
      immutable: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    strict: "throw",// Prevents saving fields not defined in the schema
    timestamps: true,
    methods: {
      verifyPassword(password) {
        return bcrypt.compare(password, this.password);
      },
    },
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
});
const User = mongoose.model("User", userSchema);
export default User;
