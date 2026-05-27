import mongoose from "mongoose";
import { connectDB } from "./db.js";
await connectDB();
const db = mongoose.connection.db;
try {
  const command = "collMod";

  await db.command({
    [command]: "users",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "email", "name", "password", "rootDirId"],
        properties: {
          _id: {
            bsonType: "objectId",
          },
          email: {
            bsonType: "string",
            pattern:
              "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$",
            description:
              "email is required and must be a valid email address example: user@example.com",
          },
          name: {
            bsonType: "string",
            minLength: 3,
            description:
              "name is required and must be at least 3 characters long",
          },
          password: {
            bsonType: "string",
            minLength: 3,
            description:
              "password is required and must be at least 3 characters long",
          },
          rootDirId: {
            bsonType: "objectId",
          },
          __v: {
            bsonType: "int",
          },
          createdAt: {
            bsonType: "date",
          },
          updatedAt: {
            bsonType: "date",
          },
        },
        additionalProperties: false,
      },
    },
  });
  await db.command({
    [command]: "directories",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "name", "parentDirId", "userId"],
        properties: {
          _id: {
            bsonType: "objectId",
          },
          name: {
            bsonType: "string",
            minLength: 3,
            description:
              "name is required and must be at least 3 characters long",
          },
          parentDirId: {
            bsonType: ["null", "objectId"],
          },
          userId: {
            bsonType: "objectId",
          },
          __v: {
            bsonType: "int",
          },
          createdAt: {
            bsonType: "date",
          },
          updatedAt: {
            bsonType: "date",
          },
        },
        additionalProperties: false,
      },
    },
  });
  await db.command({
    [command]: "files",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "dirId", "extension", "name", "size", "userId"],
        properties: {
          _id: {
            bsonType: "objectId",
          },
          dirId: {
            bsonType: "objectId",
          },
          extension: {
            bsonType: "string",
          },
          name: {
            bsonType: "string",
          },
          size: {
            bsonType: "null",
          },
          userId: {
            bsonType: "objectId",
          },
          __v: {
            bsonType: "int",
          },
          createdAt: {
            bsonType: "date",
          },
          updatedAt: {
            bsonType: "date",
          },
        },
        additionalProperties: false,
      },
    },
  });
  await db.command({
    [command]: "sessions",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "userId", "createdAt", "ip", "userAgent"],
        properties: {
          _id: {
            bsonType: "objectId",
          },
          userId: {
            bsonType: "objectId",
          },
          createdAt: {
            bsonType: "date",
          },
          ip: {
            bsonType: "string",
          },
          userAgent: {
            bsonType: "string",
          },
        },
        additionalProperties: false,
      },
    },
  });
} catch (error) {
  console.error("Error during setup:", error);
} finally {
  await mongoose.connection.close();
}
