import express from "express";
import checkAuth from "../MiddleWare/authMW.js";
import {
  getUserData,
  loginWithGoogle,
  logout,
  logoutAll,
  signin,
  signup,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/", checkAuth, getUserData);
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google-signin", loginWithGoogle);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);


export default router;
