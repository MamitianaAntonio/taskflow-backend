import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getAllTodos,
  getTodoByTitle,
  updateTodo,
} from "../controllers/todo.controller.ts";
import authMiddleware from "../middleware/auth.middleware.ts";

const router = Router();

// all routes concerned todos
/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos
 *     tags:
 *       - Todos
 *     responses:
 *       200:
 *         description: Successfully fetched todos
 */
router.get("/", authMiddleware, getAllTodos);

/**
 * @swagger
 * /api/todos/title:
 *   get:
 *     summary: Get todo by title
 *     tags:
 *       - Todos
 *     responses:
 *       200:
 *         description: Todo found
 */
router.get("/title", authMiddleware, getTodoByTitle);

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     tags:
 *       - Todos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum:
 *                   - todo
 *                   - doing
 *                   - done
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: Todo created
 */
router.post("/", authMiddleware, createTodo);

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum:
 *                   - todo
 *                   - doing
 *                   - done
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: Todo updated
 */
router.put("/:id", authMiddleware, updateTodo);

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo deleted
 */
router.delete("/:id", authMiddleware, deleteTodo);

export default router;
