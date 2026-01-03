// services/userService.ts - Example for user profile picture
import { handleMutationFiles } from "../utils/handleMutationFiles";
import User, { IUser } from "../models/UserModel";

const updateUser = async (
  userId: string,
  data: any,
  files: Express.Multer.File[] = []
) => {
  // Update user data
  const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true });

  if (!updatedUser) {
    throw new Error("User not found");
  }

  // Handle profile picture if provided
  if (files.length > 0) {
    await handleMutationFiles(
      "User", // Model name
      userId,
      files
    );
  }

  return updatedUser;
};

const deleteUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Delete all files associated with user
  await handleMutationFiles("User", userId, []);

  // Perform soft delete
  user.isActive = false;
  return await user.save();
};
