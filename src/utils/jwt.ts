import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

export const generateToken = (userId: string) =>
  jwt.sign({ userId }, SECRET_KEY, { expiresIn: "7d" });

export const verifyToken = (token: string) =>
  jwt.verify(token, SECRET_KEY) as { userId: string };
