import { rm } from "node:fs/promises";
import path from "node:path";
import { ObjectId } from "mongodb";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";

//Serving Dir Content
export const getDirectoryContent = async (req, res) => {
  try {
    const id = req.params.id || req.user.rootDirId;
    const dir = await Directory.findOne({ userId: req.user._id, _id: id })
      .select("_id")
      .lean();
    if (!dir) {
      return res.status(404).json({ message: "Directory Not Found" });
    }

    const directories = await Directory.find({
      parentDirId: id,
      userId: req.user._id,
    }).lean();

    const files = await File.find({ dirId: id, userId: req.user._id }).lean();

    res.status(200).json({ directories, files });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong while fetching directory content",
    });
  }
};

//Creating Directory
export const createDirectory = async (req, res) => {
  try {
    const userData = req.user;
    const id = req.params.id || req.user.rootDirId;
    const name = req.body.newDir;

    const parentDir = await Directory.findOne({ _id: id, userId: userData.userId })
      .select("_id")
      .lean();
    if (!parentDir) {
      return res.status(404).json({ message: "Parent Directory Not Found" });
    }

    const result = await Directory.insertOne({
      name: name,
      parentDirId: id,
      userId: userData.userId,
    });
    if (!result) {
      return res.status(500).json({ message: "Error Creating Directory" });
    }

    res.status(201).json({ message: "Directory Created" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong while creating directory" });
  }
};

//Rename Directory
export const renameDirectory = async (req, res) => {
  try {
    const { id } = req.params;
    const newName = req.body.newName || "untitled";
    const result = await Directory.findOneAndUpdate(
      { _id: new ObjectId(id), userId: req.user.userId },
      { name: newName },
      { new: true },
    );
    if (!result) {
      return res.status(404).json({ message: "Directory Not Found" });
    }
    res.status(200).json({ message: "Directory Renamed Successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong while renaming directory" });
  }
};

//Delete directory From Server
export const deleteDirectory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Directory.findOne({ _id: id, userId: req.user.userId })
      .select("_id")
      .lean();
    if (!result) {
      return res
        .status(404)
        .json({ message: "Directory Not Found Or Access Denied" });
    }

    const { directories, files } = await DirectoryContent(
      id,
      req.user.userId,
    );
    for (const { _id: id, extension } of files) {
      const filePath = safePath(`${id.toString()}${extension}`);
      await rm(filePath, { force: true });
    }

    await File.deleteMany({
      _id: { $in: files.map(({ _id }) => _id) },
      userId: req.user.userId,
    });

    await Directory.deleteMany({
      _id: { $in: [...directories.map(({ _id }) => _id), id] },
      userId: req.user.userId,
    });

    res.status(200).json({ message: "Directory Deleted Successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong while deleting directory" });
  }
};

//Recursive function to get all subdirectories and files of a directory
async function  DirectoryContent(id, userId) {
  try {
    const directories = await Directory.find({ parentDirId: id, userId })
      .select("_id")
      .lean();
    const files = await File.find({ dirId: id, userId })
      .select("_id extension")
      .lean();
    for (const { _id: id } of directories) {
      const { directories: subDirs, files: subFiles } =
        await DirectoryContent(id, userId);
      directories.push(...subDirs);
      files.push(...subFiles);
    }
    return { directories, files };
  } catch (err) {
    throw err;
  }
}

//***********************Path traversal protection**************************
function safePath(urlPath = "") {
  const base = path.resolve("storage");
  const target = path.resolve(base, urlPath);
  if (!target.startsWith(base)) {
    throw new Error("Path traversal detected");
  }
  return target;
}
