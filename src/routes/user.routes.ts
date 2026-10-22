import { Router } from "express";
import {
  deleteUserAccountController,
  loginUserController,
  registerUserController,
  updateAvatarController,
  updateEmailController,
  updateGenderController,
  updatePasswordController,
  updateUserNameController,
} from "../controllers/user.controller.ts";
import authMiddleware from "../middleware/auth.middleware.ts";

const router = Router();

// all routes concerned user route
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully, returns a session token like /login
 */
router.post("/register", registerUserController);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", loginUserController);

/**
 * @swagger
 * /api/users/update-name:
 *   put:
 *     summary: Update the current user's name
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Name updated successfully
 */
router.put("/update-name", authMiddleware, updateUserNameController);

/**
 * @swagger
 * /api/users/update-password:
 *   put:
 *     summary: Update the current user's password
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required:
 *               - oldPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.put("/update-password", authMiddleware, updatePasswordController);

/**
 * @swagger
 * /api/users/update-email:
 *   put:
 *     summary: Update the current user's email
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Email updated successfully
 *       400:
 *         description: Invalid email or email already in use
 *       401:
 *         description: Unauthorized
 */
router.put("/update-email", authMiddleware, updateEmailController);

/**
 * @swagger
 * /api/users/update-gender:
 *   put:
 *     summary: Update the current user's gender
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 nullable: true
 *             required:
 *               - gender
 *     responses:
 *       200:
 *         description: Gender updated successfully
 *       400:
 *         description: Invalid gender
 *       401:
 *         description: Unauthorized
 */
router.put("/update-gender", authMiddleware, updateGenderController);

/**
 * @swagger
 * /api/users/update-avatar:
 *   put:
 *     summary: Update the current user's avatar variant
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatarId:
 *                 type: integer
 *                 minimum: 0
 *             required:
 *               - avatarId
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       400:
 *         description: Invalid avatar id
 *       401:
 *         description: Unauthorized
 */
router.put("/update-avatar", authMiddleware, updateAvatarController);

/**
 * @swagger
 * /api/users/delete-account:
 *   delete:
 *     summary: Delete the current user's account
 *     description: Deletes the user and cascades to all their todos and projects.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/delete-account", authMiddleware, deleteUserAccountController);

export default router;
