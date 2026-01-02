// utils/cloudinaryConfig.ts
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

let isConfigured = false;

const configureCloudinary = () => {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("❌ Cloudinary environment variables are missing:");
    console.error(`CLOUDINARY_NAME: ${cloudName ? "✓" : "✗"}`);
    console.error(`CLOUDINARY_API_KEY: ${apiKey ? "✓" : "✗"}`);
    console.error(`CLOUDINARY_API_SECRET: ${apiSecret ? "✓" : "✗"}`);
    throw new Error("Cloudinary configuration is incomplete");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  isConfigured = true;
  console.log("✅ Cloudinary configured successfully");
};

/**
 * Get folder path based on file type
 * This organizes files in Cloudinary by type
 */
const getFolderByFileType = (fileType: string): string => {
  switch (fileType) {
    case "image/jpeg":
    case "image/png":
    case "image/gif":
    case "image/webp":
      return "images";
    case "application/pdf":
      return "pdfs";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    case "application/vnd.ms-excel":
      return "spreadsheets";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/msword":
      return "documents";
    default:
      return "other";
  }
};

/**
 * Map MIME type to our file type categories
 */
const getFileTypeFromMimeType = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return "spreadsheet";
  if (mimeType.includes("document") || mimeType.includes("word"))
    return "document";
  return "other";
};

/**
 * Direct Cloudinary upload function for v2
 * This allows us to upload file buffers directly to Cloudinary
 */
const uploadToCloudinary = async (
  buffer: Buffer,
  options: any = {}
): Promise<any> => {
  configureCloudinary(); // Ensure Cloudinary is configured before use

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Convert buffer to stream and pipe to uploadStream
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary by its public ID (v2 syntax)
 */
const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  configureCloudinary(); // Ensure Cloudinary is configured before use

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`❌ Cloudinary deletion failed:`, error);
    throw error;
  }
};

/**
 * Alternative upload method using base64 string (v2)
 */
const uploadBase64ToCloudinary = async (
  base64String: string,
  options: any = {}
): Promise<any> => {
  configureCloudinary(); // Ensure Cloudinary is configured before use

  try {
    const result = await cloudinary.uploader.upload(base64String, options);
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export {
  cloudinary,
  uploadToCloudinary,
  uploadBase64ToCloudinary,
  deleteFromCloudinary,
  getFolderByFileType,
  getFileTypeFromMimeType,
  configureCloudinary, // Export for manual configuration if needed
};
