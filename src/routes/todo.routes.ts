import { Router } from "express";
import {
  addChecklistItem,
  createTodo,
  deleteChecklistItem,
  deleteTodo,
  getAllTodos,
  getTodoByTitle,
  updateChecklistItem,
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
 *               description:
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
 *               projectId:
 *                 type: string
 *                 format: uuid
 *               parentId:
 *                 type: string
 *                 format: uuid
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
 *               description:
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
 *               projectId:
 *                 type: string
 *                 format: uuid
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

/**
 * @swagger
 * /api/todos/{id}/checklist:
 *   post:
 *     summary: Add a checklist item to a todo
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
 *               text:
 *                 type: string
 *             required:
 *               - text
 *     responses:
 *       201:
 *         description: Checklist item added
 */
router.post("/:id/checklist", authMiddleware, addChecklistItem);

/**
 * @swagger
 * /api/todos/{id}/checklist/{itemId}:
 *   patch:
 *     summary: Update a checklist item (text and/or done)
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
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
 *               text:
 *                 type: string
 *               done:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Checklist item updated
 */
router.patch("/:id/checklist/:itemId", authMiddleware, updateChecklistItem);

/**
 * @swagger
 * /api/todos/{id}/checklist/{itemId}:
 *   delete:
 *     summary: Delete a checklist item from a todo
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Checklist item deleted
 */
router.delete("/:id/checklist/:itemId", authMiddleware, deleteChecklistItem);

export default router;
