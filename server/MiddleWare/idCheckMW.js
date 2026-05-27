import { ObjectId } from "mongodb";

export default function checkId(req, res, next, id) {
  if (!id) return next(); 
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid MongoDB ID" });
  }
  next();
}