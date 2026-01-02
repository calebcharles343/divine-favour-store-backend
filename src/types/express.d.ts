// types/express.d.ts
import { IUser } from "../models/UserModel";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      files?: Express.Multer.File[];
    }
  }
}

export {};
