// services/authService.ts
import User, { IUser } from "../models/UserModel";
import { verifyToken } from "../utils/jwtUtils";

export const register = async (userData: any) => {
  const { email, password, firstName, lastName, role, position, phone } =
    userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  return await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || "STAFF",
    position,
    phone,
  });
};

export const login = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email, isActive: true }).select(
    "+password"
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Incorrect email or password");
  }

  user.lastLogin = new Date();
  await user.save();

  return user;
};

export const protect = async (token: string) => {
  if (!token) {
    throw new Error("You are not logged in! Please log in to get access.");
  }

  const decoded: any = await verifyToken(token);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new Error("The user belonging to this token no longer exists.");
  }

  return currentUser;
};

export const restrictTo = (...roles: string[]) => {
  return (user: IUser) => {
    if (!roles.includes(user.role)) {
      throw new Error("You do not have permission to perform this action");
    }
    return true;
  };
};

export const updatePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw new Error("Your current password is wrong");
  }

  user.password = newPassword;
  await user.save();

  return user;
};

// export const getUserByIdService = async (id: string) => {
//   const user = await User.findById(id);

//   if (!user) {
//     throw new Error(`User with ID ${id} not found`);
//   }

//   return user;
// };
