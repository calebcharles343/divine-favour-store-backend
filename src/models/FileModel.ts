import { Schema, model, Document, Types } from "mongoose";

export interface IFile {
  [x: string]: any;
  name: string;
  url: string;
  cloudinaryId: string;
  mimeType: string;
  size: number;
  fileType: "image" | "pdf" | "spreadsheet" | "document" | "other";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFileDocument extends IFile, Document {
  id: string;
}

/**
 * File Schema for storing file metadata
 * This schema stores information about uploaded files and their locations in Cloudinary
 */
const FileSchema = new Schema<IFileDocument>(
  {
    // Original file name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // The URL where the file can be accessed
    url: {
      type: String,
      required: true,
      trim: true,
    },

    // Cloudinary resource ID for managing the file
    cloudinaryId: {
      type: String,
      required: true,
      trim: true,
    },

    // MIME type of the file
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    // Size of the file in bytes
    size: {
      type: Number,
      required: true,
    },

    // File type (e.g., 'image', 'pdf', 'document', 'spreadsheet')
    fileType: {
      type: String,
      required: true,
      enum: ["image", "pdf", "spreadsheet", "document", "other"],
      trim: true,
    },

    // Optional description of the file
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        // Remove _id and use the virtual id that's already included via virtuals: true
        const { _id, ...result } = ret;
        return result;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        // Remove _id and use the virtual id that's already included via virtuals: true
        const { _id, ...result } = ret;
        return result;
      },
    },
  }
);

// Index for faster queries
FileSchema.index({ fileType: 1 });
FileSchema.index({ createdAt: -1 });

// Add virtual id field - this will be automatically included when virtuals: true is set
FileSchema.virtual("id").get(function () {
  return this._id.toString();
});

const File = model<IFileDocument>("File", FileSchema);

export default File;
