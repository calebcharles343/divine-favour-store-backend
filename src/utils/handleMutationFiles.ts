// utils/handleMutationFiles.ts

import fileService from "../services/fileService";

/**
 * Utility function to handle files for mutation operations
 * Deletes all existing files and uploads new ones
 *
 * @param modelName - The name of the model
 * @param documentId - The ID of the document
 * @param files - Array of uploaded files
 * @returns Promise<void>
 */
export const handleMutationFiles = async (
  modelName: string,
  documentId: string,
  files: Express.Multer.File[] = []
): Promise<void> => {
  // Delete all existing files for this document
  await fileService.deleteFilesByDocument(modelName, documentId);

  // If new files are provided, upload them
  if (files.length > 0) {
    // Import handleFileUploads dynamically to avoid circular dependencies
    const { default: handleFileUploads } = await import("./handleFileUploads");

    await handleFileUploads({
      files,
      requestId: documentId,
      modelName,
    });
  }
};
