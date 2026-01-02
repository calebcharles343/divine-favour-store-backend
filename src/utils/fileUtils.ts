/**
 * Utility functions for file operations
 */

/**
 * Validate allowed file types
 * @param mimeType - The MIME type of the file
 * @returns Whether the file type is allowed
 */
const isAllowedFileType = (mimeType: string): boolean => {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",

    // PDFs
    "application/pdf",

    // Excel files
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",

    // Word documents
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];

  return allowedTypes.includes(mimeType);
};

/**
 * Format file size for display
 * @param bytes - The file size in bytes
 * @returns Formatted file size with units
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
  else return (bytes / 1073741824).toFixed(2) + " GB";
};

/**
 * Extract file extension from filename
 * @param filename - The original filename
 * @returns The file extension
 */
const getFileExtension = (filename: string): string => {
  const parts = filename.split(".");
  if (parts.length === 1) return ""; // No extension
  return parts.pop()!.toLowerCase();
};

/**
 * Generate a safe filename
 * @param originalName - The original filename
 * @returns A safe filename with timestamp
 */
const generateSafeFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const extension = getFileExtension(originalName);
  const baseName = originalName
    .split(".")
    .slice(0, -1)
    .join(".")
    .replace(/[^a-zA-Z0-9]/g, "-");

  return `${baseName}-${timestamp}.${extension}`;
};

export {
  isAllowedFileType,
  formatFileSize,
  getFileExtension,
  generateSafeFilename,
};
