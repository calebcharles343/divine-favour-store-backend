// config/env.ts
import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "MONGODB_URI",
  "CLOUDINARY_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars);
  process.exit(1);
}

console.log("✅ Environment variables loaded successfully");
