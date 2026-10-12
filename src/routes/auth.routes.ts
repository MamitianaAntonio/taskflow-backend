import { Router } from "express";
import { googleAuthController } from "../controllers/auth.controller.ts";

const router = Router();

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Login or register with a Google ID token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *                 description: The ID token returned by Google Sign-In
 *             required:
 *               - credential
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: No credential provided
 *       401:
 *         description: Google authentication failed
 */
router.post("/google", googleAuthController);

export default router;
