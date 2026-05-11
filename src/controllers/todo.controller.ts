import type { Request, Response } from "express";
import prisma from "../prismaClient.ts";

// get all todos
export const getAllTodos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ todos });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

// get a todo by title
export const getTodoByTitle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const { title } = req.query;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }
    // fetch using prisma methods
    const todo = await prisma.todo.findFirst({
      where: {
        title: {
          equals: title,
          mode: "insensitive",
        },
        userId,
      },
    });

    if (!todo) {
      return res.status(404).json({ error: "Todo not found " });
    }

    res.json({ todo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch the todo" });
  }
};

const todoStatuses = ["todo", "doing", "done"] as const;

type TodoStatus = (typeof todoStatuses)[number];

// create a new todo
export const createTodo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const { title, dueDate, priority, status } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (status !== undefined && !todoStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${todoStatuses.join(", ")}`,
      });
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        userId,
        status: status ?? "todo",
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority ?? "medium",
      },
    });

    res.status(201).json({
      message: "Todo is created",
      todo,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
};

// update todo
export const updateTodo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const { id } = req.params;
    const { title, status, dueDate, priority } = req.body;

    if (status !== undefined && !todoStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${todoStatuses.join(", ")}`,
      });
    }

    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(id) },
    });

    if (!todo || todo.userId !== userId) {
      return res.status(!todo ? 404 : 403).json({
        error: !todo
          ? "Todo not found"
          : "You are not allowed to modify this todo",
      });
    }

    const data: {
      title?: string;
      status?: TodoStatus;
      dueDate?: Date | null;
      priority?: string;
    } = {};

    if (title !== undefined) data.title = title;
    if (status !== undefined) data.status = status;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) data.priority = priority;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        error: "At least one field (title, status, dueDate, priority) is required to update",
      });
    }

    const updated = await prisma.todo.update({
      where: { id: todo.id },
      data,
    });

    res.json({
      message: "Todo is updated",
      updated,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update todo." });
  }
};

// delele a todo
export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const { id } = req.params;

    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(id) },
    });

    if (!todo || todo.userId !== userId) {
      return res.status(404).json({ error: "Todo not found." });
    }

    await prisma.todo.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete todo." });
  }
};
