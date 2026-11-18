import { db } from "./config/firebase.js";

async function testConnection() {
  try {
    await db.listCollections();
    console.log("Firebase Admin SDK connected successfully!");
  } catch (error) {
    console.error("Firebase connection failed:", error.message);
  }
}

testConnection();