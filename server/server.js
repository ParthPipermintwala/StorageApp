import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";

dotenv.config();

await connectDB();
await connectRedis();

app.listen(process.env.PORT, () => {
  console.log("server is started and running");
});
