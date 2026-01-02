// utils/handleFileUploads.ts
import fileService from "../services/fileService";
import { IFile } from "../models/FileModel";

// Interface for file object
interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

// Interface for function parameters
interface HandleFileUploadsParams {
  files: UploadedFile[];
  requestId: string;
  modelName: string; // Changed from modelTable to modelName
  fieldName?: string | null; // Optional field name
}

// Interface for return type
interface HandleFileUploadsResult {
  uploadedFiles: IFile[];
  associationsCount: number;
}

/**
 * Helper method for file uploads
 * Uploads multiple files and associates them with a document
 * Returns information about the uploaded files and associations
 */
const handleFileUploads = async ({
  files,
  requestId,
  modelName, // Changed from modelTable to modelName
  fieldName = null,
}: HandleFileUploadsParams): Promise<HandleFileUploadsResult> => {
  // Upload all files to Cloudinary and save to MongoDB
  const uploadedFiles: IFile[] = await Promise.all(
    files.map((file) =>
      fileService.uploadFile({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      })
    )
  );

  // Create associations for all uploaded files
  await Promise.all(
    uploadedFiles.map((file) =>
      fileService.associateFile(
        file._id.toString(),
        modelName, // Use modelName
        requestId,
        fieldName
      )
    )
  );

  return {
    uploadedFiles,
    associationsCount: uploadedFiles.length,
  };
};

export default handleFileUploads;
