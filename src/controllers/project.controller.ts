import type { Request, Response } from "express";
import * as projectService from "../services/project.service.ts";

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const projects = await projectService.getAllProjects(userId);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects " });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid project ID" });

    const project = await projectService.getProjectById(userId, id);

    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required " });
    const project = await projectService.createProject({
      name,
      description,
      userId,
    });

    res.status(201).json({ message: "Project created ", project });
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid project ID" });

    const { name, description } = req.body;

    if (!name && !description) {
      return res
        .status(400)
        .json({ error: "At least name or description is required" });
    }

    const data: { name?: string; description?: string } = {};

    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;

    const project = await projectService.updateProject(userId, id, data);
    res.json({ message: "Project updated", project });
  } catch (error) {
    const message = (error as Error).message;
    const status = message === "Project not found" ? 404 : 500;
    res.status(status).json({ error: message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid project ID" });

    await projectService.deleteProject(userId, id);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    const message = (error as Error).message;
    const status = message === "Project not found" ? 404 : 500;
    res.status(status).json({ error: message });
  }
};
