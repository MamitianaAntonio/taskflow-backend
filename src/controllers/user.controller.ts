import type { Request, Response } from "express";
import {
  loginUser,
  registerUser,
  updateUserName,
  updateUserPassword,
} from "../services/user.service.ts";

// logic controller to register an account
export const registerUserController = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const user = await registerUser(email, password, name);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// logic to log
export const loginUserController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);
    res.status(200).json({
      message: "Login successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};

// logic to update username
export const updateUserNameController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!name) {
      return res.status(400).json({ error: "New name is required" });
    }

    const updatedUser = await updateUserName(userId, name);
    res.json({
      message: "Name updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};

// login controller to update password
export const updatePasswordController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { oldPassword, newPassword } = req.body;

    if (!userId) throw new Error("Unauthorized");
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Both old and new passwords are required",
      });
    }

    await updateUserPassword(userId, oldPassword, newPassword);
    res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      error: (error as Error).message,
    });
  }
};
