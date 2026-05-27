import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileRoutes from "./routes/fileRoutes.js";
import directoryRoutes from "./routes/directoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import checkAuth from "./MiddleWare/authMW.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";

export const app = express();

//disabling express header
app.disable("x-powered-by");

//using cookie parser middleware
app.use(cookieParser(process.env.COOKIE_SECRET));

//convert upcoming data to json
app.use(express.json());

//Enabling Cores Using Cors Package
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, //allowing cookies to be sent with requests from the frontend
  }),
);

//Routing
app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/user", authRoutes);
app.use("/otp", otpRoutes);

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({ message: "File limit is 5" });
  }
  res.status(err.status || 500).json({ message: "something went wrong" });
});
