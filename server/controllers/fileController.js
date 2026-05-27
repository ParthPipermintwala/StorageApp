import { rm } from "node:fs/promises";
import path from "node:path";
import File from "../models/fileModel.js";
import Directory from "../models/directoryModel.js";

//serve or download file
export const getFile = async (req, res) => {
  const id = req.params.id || req.user.rootDirId;
  const fileRecord = await File.findOne({ _id: id, userId: req.user.userId })
    .select("name extension -_id")
    .lean();
  if (!fileRecord) {
    return res.status(404).json({ message: "File Not Found or Access Denied" });
  }

  const filePath = safePath(id + fileRecord.extension);
  if (req.query.action === "download") {
    return res.download(
      filePath,
      fileRecord.name + fileRecord.extension,
      (err) => {
        if (err && !res.headersSent) {
          res.status(500).json({ message: "Error in downloading file" });
        }
      },
    );
  }
  res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ message: "Error in serving file" });
    }
  });
};

//upload file
export const uploadFile = async (req, res) => {
  try {
    const id = req.params.id || req.user.rootDirId;
    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    const parentDir = await Directory.findOne({ _id: id, userId: req.user.userId })
      .select("_id")
      .lean();
    if (!parentDir) {
      return res
        .status(404)
        .json({ message: "Parent Directory Not Found or Access Denied" });
    }
    const fileRecord = await File.create(
      req.uploadedFiles.map((file) => ({
        ...file,
        userId: req.user.userId,
        dirId: id,
      })),
    );
    if (fileRecord.length === 0) {
      throw new Error("Failed to save file metadata");
    }
    res.status(201).json({
      message: "Files uploaded successfully",
      count: fileRecord.length,
    });
  } catch (err) {
    console.log(err.message);
    if (req.uploadedFiles) {
      for (const file of req.uploadedFiles) {
        const filePath = safePath(file._id.toString() + file.extension);
        await rm(filePath, { force: true });
      }
    }
    if (!res.headersSent) {
      res.status(500).json({ message: "Error in saving file metadata" });
    }
  }
};

//delete file
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { extension } = await File.findOne({ _id: id, userId: req.user.userId })
      .select("extension -_id")
      .lean();

    if (!extension) {
      return res
        .status(404)
        .json({ message: "File Not Found or Access Denied" });
    }

    const result = await File.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "File Not Found or Access Denied" });
    }

    const filePath = safePath(id.toString() + extension);
    await rm(filePath, { force: true });

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error in deleting file" });
  }
};

//rename file
export const renameFile = async (req, res) => {
  try {
    const { id } = req.params;
    const newName = req.body.newName;

    const result = await File.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { name: newName },
      { new: true },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "File Not Found or Access Denied" });
    }

    res.status(200).json({ message: "File renamed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error in renaming file" });
  }
};

//*******************Path traversal protection**************************
function safePath(urlPath = "") {
  const base = path.resolve("storage");
  const target = path.resolve(base, urlPath);
  if (!target.startsWith(base)) {
    throw new Error("Path traversal detected");
  }
  return target;
}
