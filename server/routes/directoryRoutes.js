import express from "express";
import checkId from "../MiddleWare/idCheckMW.js";
import {
  createDirectory,
  deleteDirectory,
  getDirectoryContent,
  renameDirectory,
} from "../controllers/directoryController.js";

const router = express.Router();

router.param("id", checkId);

//Creating Directory
router.post("/{:id}", createDirectory);

//Serving Dir Content
router.get("/{:id}", getDirectoryContent);

//Rename Directory
router.patch("/:id", renameDirectory);

//Delete directory From Server
router.delete("/:id", deleteDirectory);

export default router;
