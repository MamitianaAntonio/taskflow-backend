import type { Request, Response } from "express";
import * as todoService from "../services/todo.service.ts";

export const getAllTodos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const todos = await todoService.getAllTodos(userId);
    res.json({ todos });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

export const getTodoByTitle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const { title } = req.query;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }

    const todo = await todoService.getTodoByTitle(userId, title);
    res.json({ todo });
  } catch (error) {
    const message = (error as Error).message;
    const status = message === "Todo not found" ? 404 : 500;
    res.status(status).json({ error: message });
  }
};

export const createTodo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const { title, dueDate, priority, status, projectId } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (status !== undefined && !todoService.todoStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${todoService.todoStatuses.join(", ")}`,
      });
    }

    const todo = await todoService.createTodo({
      title,
      userId,
      status,
      dueDate,
      priority,
      projectId: projectId ? parseInt(projectId) : undefined,
    });

    res.status(201).json({ message: "Todo is created", todo });
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid todo ID" });

    const { title, status, dueDate, priority } = req.body;

    if (status !== undefined && !todoService.todoStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${todoService.todoStatuses.join(", ")}`,
      });
    }

    if (!title && !status && !dueDate && !priority) {
      return res.status(400).json({
        error: "At least one field (title, status, dueDate, priority) is required",
      });
    }

    const todo = await todoService.updateTodo(userId, id, {
      title,
      status,
      dueDate,
      priority,
    });

    res.json({ message: "Todo is updated", todo });
  } catch (error) {
    const message = (error as Error).message;
    const status = message === "Todo not found" ? 404
      : message === "Forbidden" ? 403
      : 500;
    res.status(status).json({ error: message });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid todo ID" });

    await todoService.deleteTodo(userId, id);
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    const message = (error as Error).message;
    const status = message === "Todo not found" ? 404
      : message === "Forbidden" ? 403
      : 500;
    res.status(status).json({ error: message });
  }
};
