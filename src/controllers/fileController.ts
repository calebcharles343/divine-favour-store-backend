// controllers/fileController.ts
import multer from "multer";
import fileService from "../services/fileService"; // Import the instance directly
import { Request, Response } from "express";

// Configure multer for memory storage (files stored in memory, not on disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});

/**
 * File Controller - Handles HTTP requests related to files
 */
class FileController {
  /**
   * Upload a file
   */
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const file = await fileService.uploadFile({
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      // Associate file with model if provided in request
      if (req.body.modelName && req.body.documentId) {
        await fileService.associateFile(
          file._id.toString(),
          req.body.modelName,
          req.body.documentId,
          req.body.fieldName || null
        );
      }

      res.status(201).json(file);
    } catch (error: any) {
      console.error("File upload error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(req: Request, res: Response) {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const files = req.files as Express.Multer.File[];
      const uploadPromises = files.map((file: Express.Multer.File) =>
        fileService.uploadFile({
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        })
      );

      const uploadedFiles = await Promise.all(uploadPromises);

      // Associate files with model if provided
      if (req.body.modelName && req.body.documentId) {
        const associationPromises = uploadedFiles.map((file: any) =>
          fileService.associateFile(
            file._id.toString(),
            req.body.modelName,
            req.body.documentId,
            req.body.fieldName || null
          )
        );

        await Promise.all(associationPromises);
      }

      res.status(201).json(uploadedFiles);
    } catch (error: any) {
      console.error("Multiple file upload error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get a file by ID
   */
  async getFile(req: Request, res: Response) {
    try {
      const file = await fileService.getFileById(req.params.id);
      res.json(file);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Get all files associated with a document
   */
  async getFilesByDocument(req: Request, res: Response) {
    try {
      const { modelName, documentId, fieldName } = req.query;

      if (!modelName || !documentId) {
        return res
          .status(400)
          .json({ error: "Model name and document ID are required" });
      }

      const files = await fileService.getFilesByDocument(
        modelName as string,
        documentId as string,
        fieldName as string | null
      );

      res.json(files);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update file metadata
   */
  async updateFile(req: Request, res: Response) {
    try {
      const updatedFile = await fileService.updateFile(req.params.id, req.body);
      res.json(updatedFile);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(req: Request, res: Response) {
    try {
      await fileService.deleteFile(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Delete all files associated with a document
   */
  async deleteFilesByDocument(req: Request, res: Response) {
    try {
      const { modelName, documentId } = req.query;

      if (!modelName || !documentId) {
        return res
          .status(400)
          .json({ error: "Model name and document ID are required" });
      }

      const count = await fileService.deleteFilesByDocument(
        modelName as string,
        documentId as string
      );
      res.json({ message: `${count} files deleted successfully` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

// Export controller and multer middleware
const fileController = new FileController();
export { fileController, upload };
