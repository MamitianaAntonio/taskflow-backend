import type { Request, Response } from "express";
import * as todoService from "../services/todo.service.ts";

export const getAllTodos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const todos = await todoService.getAllTodos(userId);
    res.json({ todos });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

export const getTodoByTitle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
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
    const userId = (req as any).user.userId as string;
    const { title, description, dueDate, priority, status, projectId, parentId } =
      req.body;

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
      description,
      userId,
      status,
      dueDate,
      priority,
      projectId: projectId ? String(projectId) : undefined,
      parentId: parentId ? String(parentId) : undefined,
    });

    res.status(201).json({ message: "Todo is created", todo });
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Parent todo not found"
        ? 404
        : message === "Forbidden"
          ? 403
          : message === "Subtasks cannot be nested further"
            ? 400
            : 500;
    res.status(status).json({ error: status === 500 ? "Failed to create todo" : message });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Invalid todo ID" });

    const { title, description, status, dueDate, priority } = req.body;

    if (status !== undefined && !todoService.todoStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${todoService.todoStatuses.join(", ")}`,
      });
    }

    if (!title && !description && !status && !dueDate && !priority) {
      return res.status(400).json({
        error:
          "At least one field (title, description, status, dueDate, priority) is required",
      });
    }

    const todo = await todoService.updateTodo(userId, id, {
      title,
      description,
      status,
      dueDate,
      priority,
    });

    res.json({ message: "Todo is updated", todo });
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Todo not found" ? 404 : message === "Forbidden" ? 403 : 500;
    res.status(status).json({ error: message });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Invalid todo ID" });

    await todoService.deleteTodo(userId, id);
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Todo not found" ? 404 : message === "Forbidden" ? 403 : 500;
    res.status(status).json({ error: message });
  }
};

export const addChecklistItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const todoId = req.params.id;
    if (!todoId) return res.status(400).json({ error: "Invalid todo ID" });

    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const item = await todoService.addChecklistItem(userId, todoId, text.trim());
    res.status(201).json({ message: "Checklist item added", item });
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Todo not found" ? 404 : message === "Forbidden" ? 403 : 500;
    res.status(status).json({ error: message });
  }
};

export const updateChecklistItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const todoId = req.params.id;
    const itemId = req.params.itemId;
    if (!todoId || !itemId)
      return res.status(400).json({ error: "Invalid checklist item ID" });

    const { text, done } = req.body;
    if (text === undefined && done === undefined) {
      return res.status(400).json({
        error: "At least one field (text, done) is required",
      });
    }

    const item = await todoService.updateChecklistItem(userId, todoId, itemId, {
      text: typeof text === "string" ? text.trim() : undefined,
      done: typeof done === "boolean" ? done : undefined,
    });
    res.json({ message: "Checklist item updated", item });
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Checklist item not found"
        ? 404
        : message === "Forbidden"
          ? 403
          : 500;
    res.status(status).json({ error: message });
  }
};

export const deleteChecklistItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const todoId = req.params.id;
    const itemId = req.params.itemId;
    if (!todoId || !itemId)
      return res.status(400).json({ error: "Invalid checklist item ID" });

    await todoService.deleteChecklistItem(userId, todoId, itemId);
    res.json({ message: "Checklist item deleted" });
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Checklist item not found"
        ? 404
        : message === "Forbidden"
          ? 403
          : 500;
    res.status(status).json({ error: message });
  }
};
