// services/FileService.ts
import { Document, Types } from "mongoose";
import File, { IFile } from "../models/FileModel";
import FileAssociation, { IFileAssociation } from "../models/FileAssociation";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getFolderByFileType,
  getFileTypeFromMimeType,
} from "../utils/cloudinaryConfig";
import { isAllowedFileType, generateSafeFilename } from "../utils/fileUtils";

// Interface for file data
interface FileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

// Interface for Cloudinary result
interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

// Interface for file association data
interface AssociationData {
  fileId: string;
  modelName: string;
  documentId: string;
  fieldName?: string | null;
}

// Interface for file update data
interface UpdateFileData {
  name?: string;
  description?: string;
}

/**
 * File Service - Handles all file operations
 */
class FileService {
  /**
   * Upload a file to Cloudinary and save metadata to MongoDB
   * @param fileData - File data including buffer and metadata
   * @returns The created file document
   */
  async uploadFile(fileData: FileData): Promise<IFile> {
    const { buffer, originalname, mimetype, size } = fileData;

    console.log("fileData===>", fileData);

    // Validate file type
    if (!isAllowedFileType(mimetype)) {
      throw new Error("File type not allowed");
    }

    // Prepare upload options
    const folder = getFolderByFileType(mimetype);
    const fileType = getFileTypeFromMimeType(mimetype);
    const safeFilename = generateSafeFilename(originalname);

    // Upload to Cloudinary
    const cloudinaryResult: CloudinaryResult = await uploadToCloudinary(
      buffer,
      {
        folder,
        resource_type: mimetype === "application/pdf" ? "raw" : "auto",
        public_id: safeFilename.split(".")[0],
      }
    );

    // Save file metadata to MongoDB
    const newFile = new File({
      name: originalname,
      url: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
      mimeType: mimetype,
      size: size,
      fileType: fileType,
    });

    return await newFile.save();
  }

  /**
   * Associate a file with another model
   * @param fileId - The ID of the file
   * @param modelName - The name of the model to associate with
   * @param documentId - The ID of the document
   * @param fieldName - Optional field name for the association
   * @returns The created association
   */
  async associateFile(
    fileId: string,
    modelName: string,
    documentId: string,
    fieldName: string | null = null
  ): Promise<IFileAssociation> {
    // Verify the file exists
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Convert documentId to ObjectId if it's a string
    let documentObjectId: Types.ObjectId;
    try {
      documentObjectId = new Types.ObjectId(documentId);
    } catch (error) {
      throw new Error("Invalid document ID format");
    }

    // Create the association - NOTE: using associatedModel instead of model
    const association = new FileAssociation({
      file: fileId,
      associatedModel: modelName, // Changed from 'model' to 'associatedModel'
      documentId: documentObjectId, // Use ObjectId
      fieldName,
    });

    return await association.save();
  }

  /**
   * Get a file by ID
   * @param fileId - The ID of the file
   * @returns The file document
   */
  async getFileById(fileId: string): Promise<IFile> {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error("File not found");
    }
    return file;
  }

  /**
   * Get all files associated with a document
   * @param modelName - The name of the model
   * @param documentId - The ID of the document
   * @param fieldName - Optional field name to filter by
   * @returns Array of file documents
   */
  async getFilesByDocument(
    modelName: string,
    documentId: string,
    fieldName: string | null = null
  ): Promise<IFile[]> {
    // Convert documentId to ObjectId
    let documentObjectId: Types.ObjectId;
    try {
      documentObjectId = new Types.ObjectId(documentId);
    } catch (error) {
      throw new Error("Invalid document ID format");
    }

    // Build query - using associatedModel instead of model
    const query: any = {
      associatedModel: modelName, // Changed from 'model' to 'associatedModel'
      documentId: documentObjectId, // Use ObjectId
    };

    // Add fieldName to query if provided
    if (fieldName) {
      query.fieldName = fieldName;
    }

    // Find associations and populate file data
    const associations = await FileAssociation.find(query).populate("file");

    // Return the file objects
    return associations.map((assoc) => (assoc as any).file as IFile);
  }

  /**
   * Update file metadata
   * @param fileId - The ID of the file
   * @param updateData - The data to update
   * @returns The updated file document
   */
  async updateFile(fileId: string, updateData: UpdateFileData): Promise<IFile> {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Only allow updating certain fields
    const allowedUpdates = ["name", "description"];
    Object.keys(updateData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        (file as any)[key] = (updateData as any)[key];
      }
    });

    file.updatedAt = new Date();
    return await file.save();
  }

  /**
   * Delete a file and its associations
   * @param fileId - The ID of the file
   * @returns Whether the deletion was successful
   */
  async deleteFile(fileId: string): Promise<boolean> {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(file.cloudinaryId);

    // Delete associations
    await FileAssociation.deleteMany({ file: fileId });

    // Delete file metadata from MongoDB
    await File.findByIdAndDelete(fileId);

    return true;
  }

  /**
   * Delete all files associated with a document
   * @param modelName - The name of the model
   * @param documentId - The ID of the document
   * @returns The number of files deleted
   */
  async deleteFilesByDocument(
    modelName: string,
    documentId: string
  ): Promise<number> {
    // Convert documentId to ObjectId
    let documentObjectId: Types.ObjectId;
    try {
      documentObjectId = new Types.ObjectId(documentId);
    } catch (error) {
      throw new Error("Invalid document ID format");
    }

    // Retrieve file associations - using associatedModel instead of model
    const associations = await FileAssociation.find({
      associatedModel: modelName, // Changed from 'model' to 'associatedModel'
      documentId: documentObjectId, // Use ObjectId
    }).populate("file");

    if (!associations.length) {
      console.log("No associated files found for deletion.");
      return 0; // No files to delete
    }

    // Proceed with file deletion
    const deletionPromises = associations.map(async (assoc) => {
      const populatedAssoc = assoc as any;
      if (populatedAssoc.file) {
        await deleteFromCloudinary(populatedAssoc.file.cloudinaryId);
        await File.findByIdAndDelete(populatedAssoc.file._id);
      }

      await FileAssociation.findByIdAndDelete(populatedAssoc._id);
    });

    await Promise.all(deletionPromises);

    return associations.length;
  }

  /**
   * Get file associations by file ID
   * @param fileId - The ID of the file
   * @returns Array of file associations
   */
  async getAssociationsByFile(fileId: string): Promise<IFileAssociation[]> {
    return await FileAssociation.find({ file: fileId });
  }

  /**
   * Remove file association (without deleting the file)
   * @param fileId - The ID of the file
   * @param modelName - The name of the model
   * @param documentId - The ID of the document
   * @returns Whether the disassociation was successful
   */
  async removeFileAssociation(
    fileId: string,
    modelName: string,
    documentId: string
  ): Promise<boolean> {
    // Convert documentId to ObjectId
    let documentObjectId: Types.ObjectId;
    try {
      documentObjectId = new Types.ObjectId(documentId);
    } catch (error) {
      throw new Error("Invalid document ID format");
    }

    const result = await FileAssociation.deleteOne({
      file: fileId,
      associatedModel: modelName,
      documentId: documentObjectId,
    });

    return result.deletedCount > 0;
  }
}

export default new FileService();
