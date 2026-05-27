import express from "express";
import multer from "multer";
import path from "node:path";
import checkId from "../MiddleWare/idCheckMW.js";
import { deleteFile, getFile, renameFile, uploadFile } from "../controllers/fileController.js";
import { Types } from "mongoose";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "storage/");
  },
  filename: function (req, file, cb) {
    const fileId = new Types.ObjectId();
    const extension = path.extname(file.originalname);
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      _id: fileId,
      name: path.parse(file.originalname).name,
      extension,
      size: file.size,
    });
    cb(null, fileId.toString() + extension);
  },
});
const upload = multer({ storage });

//Param Middleware to validate ID
router.param("id", checkId);

//Serve Static File To Client
router.get("/:id", getFile);

//Delete File From Server
router.delete("/:id", deleteFile);

//Rename File
router.patch("/:id", renameFile);

//Upload File
router.post("/{:id}", upload.array("file", 5), uploadFile);

export default router;
