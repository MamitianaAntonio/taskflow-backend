import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check that the API is awake
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: The API is running
 */
router.get("/", (_req, res) => {
  // Deliberately free of auth and database access: this endpoint only wakes
  // the instance up, so it must answer as fast as possible.
  res.status(200).json({ status: "ok" });
});

export default router;
