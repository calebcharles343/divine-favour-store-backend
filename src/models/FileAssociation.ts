// models/FileAssociation.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IFileAssociation {
  file: Types.ObjectId;
  associatedModel: string; // Renamed from 'model' to match schema
  documentId: Types.ObjectId;
  fieldName?: string | null;
  createdAt: Date;
}

export interface IFileAssociationDocument extends IFileAssociation, Document {
  id: string;
}

const FileAssociationSchema = new Schema<IFileAssociationDocument>(
  {
    file: {
      type: Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },
    associatedModel: {
      type: String,
      required: true,
      trim: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    fieldName: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        const { _id, ...result } = ret;
        return result;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        const { _id, ...result } = ret;
        return result;
      },
    },
  }
);

FileAssociationSchema.index({ file: 1 });
FileAssociationSchema.index({ associatedModel: 1, documentId: 1 });
FileAssociationSchema.index({ documentId: 1 });

FileAssociationSchema.virtual("id").get(function () {
  return this._id.toString();
});

const FileAssociation = model<IFileAssociationDocument>(
  "FileAssociation",
  FileAssociationSchema
);

export default FileAssociation;
