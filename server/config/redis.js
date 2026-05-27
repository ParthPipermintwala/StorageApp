import { createClient } from "redis";

const clientRedis = createClient( {
  url: process.env.REDIS_URL,
} );
clientRedis.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

clientRedis.on("connect", () => {
  console.log("Redis connected");
});

const connectRedis = async () => {
  if (!clientRedis.isOpen) {
    await clientRedis.connect();
  }
  try {
    const searchIndices = await clientRedis.ft._list();
    if (searchIndices.includes("userIdIdx")) return;
    await clientRedis.ft.create(
      "userIdIdx",
      {
        "$.userId": { type: SchemaFieldTypes.TAG, AS: "userId" },
        "$.createdAt": { type: SchemaFieldTypes.NUMERIC, AS: "createdAt" },
      },
      {
        ON: "JSON",
        PREFIX: ["session:"],
      },
    );
  } catch (err) {
    console.error("Error creating Redis search index:", err);
    throw err;
  }
};

process.on("SIGINT", async () => {
  await clientRedis.quit();
  console.log("Redis connection closed");
  process.exit(0);
});

export default clientRedis;
export { connectRedis };
