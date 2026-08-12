import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.ts";
import prisma from "../prismaClient.ts";

// function to register a new user
export async function registerUser(
  email: string,
  password: string,
  name?: string,
) {
  const hashedPassword = await bcrypt.hash(password, 12);

  return await prisma.userAccount.create({
    data: { email, password: hashedPassword, name },
  });
}

// function to login
export async function loginUser(email: string, password: string) {
  const user = await prisma.userAccount.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid password");
  const token = generateToken(user.id);

  return { token, user };
}

// update user name
export async function updateUserName(userId: number, name: string) {
  return await prisma.userAccount.update({
    where: { id: userId },
    data: { name },
  });
}

// change password
export async function updateUserPassword(
  userId: number,
  oldPassword: string,
  newPassword: string,
) {
  const user = await prisma.userAccount.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  // verify old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  return await prisma.userAccount.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });
}

// update user email
export async function updateUserEmail(userId: number, email: string) {
  const existing = await prisma.userAccount.findUnique({ where: { email } });

  if (existing && existing.id !== userId) {
    throw new Error("Email already in use");
  }

  return await prisma.userAccount.update({
    where: { id: userId },
    data: { email },
  });
}

// delete user account
export async function deleteUserAccount(userId: number) {
  return await prisma.userAccount.delete({ where: { id: userId } });
}
