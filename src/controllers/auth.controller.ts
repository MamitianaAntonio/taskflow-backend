import type { Request, Response } from "express";
import { googleAuthenticate } from "../services/user.service.ts";

// exchange a Google ID token for a TaskFlow JWT
export const googleAuthController = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "No credential provided" });
    }

    const { token, user } = await googleAuthenticate(credential);

    res.status(200).json({
      message: "Login successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        gender: user.gender,
        avatarId: user.avatarId,
      },
    });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};
