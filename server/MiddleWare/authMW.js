import { Types } from "mongoose";
import clientRedis from "../config/redis.js";
export default async function checkAuth(req, res, next) {
  try {
    const { sid } = req.signedCookies;
    if (!sid) {
      return res.status(401).json({ message: "Unauthorized Access" });
    }
    const session = await clientRedis.json.get(`session:${sid}`, {
      path: ["$.userId", "$.rootDirId"],
    });
    if (!session) {
      return res.status(401).json({ message: "Invalid Session" });
    }
    if (!Types.ObjectId.isValid(session.userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    req.user = session;
    next();
  } catch (err) {
    console.error("Auth check error:", err);
    next(err);
  }
}
