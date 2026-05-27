import crypto from "crypto";
import clientRedis from "../config/redis.js";
import Directory from "../models/directoryModel.js";
import parseUserAgent from "../utils/parseUserAgent.js";

export const createSession = async (req, res, userId) => {
  const rootDir = await Directory.findOne({ userId, parentId: null })
    .select("_id")
    .lean();
  if (!rootDir || !rootDir._id) {
    throw new Error("Root directory not found for user");
  }
  const sessionId = crypto.randomBytes(32).toString("hex");
  const sessionData = {
    userId,
    rootDirId: rootDir._id,
    device: parseUserAgent(req.headers["user-agent"]),
    ip: req.ip,
    createdAt: new Date(),
  };
  await clientRedis.json.set(`session:${sessionId}`, "$", sessionData);
  await clientRedis.expire(`session:${sessionId}`, 15 * 24 * 60 * 60);

  res.cookie("sid", sessionId, {
    httpOnly: true, //accessible only by web server not by client-side scripts
    secure: false,
    signed: true,
    sameSite: "lax", //allow sending cookies with cross-site requests
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });
};

export const limitSessions = async (userId) => {
  const session = await clientRedis.ft.search(
    "userIdIdx",
    `@userId:{${userId}}`,
    {
      SORTBY: "createdAt",
      DIRECTION: "ASC",
      RETURN: [],
      LIMIT: {
        from: 0,
        size: 1,
      }
    },
  );  

  if (session.total >= 3 && session.documents.length) {
    await clientRedis.del(`${session.documents[0].id}`);
  }
};

export const deleteSession = async (sid) => {
  try {
    if (sid) {
      await clientRedis.del(`session:${sid}`);
    }
    throw new Error("Session ID is required");
  } catch (err) {
    console.error("Error deleting session:", err);
    throw err;
  }
};

export const deleteAllSessions = async (sid) => {
  try{
     if (!sid) {
    throw new Error("Session ID is required");
  }
  const sessionData = await clientRedis.json.get(`session:${sid}`);
  if (!sessionData || !sessionData.userId) {
    throw new Error("Invalid Session ID");
  }
  const session = await clientRedis.ft.search(
    "userIdIdx",
    `@userId:{${sessionData.userId}}`,
    {
      RETURN: [],
    },
  );
  if (!session.documents.length) {
    throw new Error("No Active Session Found");
  }
  await Promise.all(session.documents.map(({ id }) => clientRedis.del(id)));

  }catch(err){
    console.error("Error deleting all sessions:", err);
    throw err;
  }
}
