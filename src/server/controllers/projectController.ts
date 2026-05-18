import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import type { CreateProjectInput, UpdateProjectInput } from "../lib/validations";
import { str } from "../lib/express";

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(str(req.query.page) || "1") || 1;
  const limit = parseInt(str(req.query.limit) || "10") || 10;
  const skip = (page - 1) * limit;
  const status = str(req.query.status);
  const ownerId = str(req.query.ownerId);

  const where: any = {};
  if (status) where.status = status;
  if (ownerId) where.ownerId = ownerId;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { epics: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.count({ where }),
  ]);

  res.json({
    data: projects,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      epics: {
        include: {
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  res.json({ data: project });
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateProjectInput = req.body;

  const project = await prisma.project.create({
    data: input,
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  res.status(201).json({ data: project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  const input: UpdateProjectInput = req.body;

  const project = await prisma.project.update({
    where: { id },
    data: input,
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  res.json({ data: project });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;

  await prisma.project.delete({
    where: { id },
  });

  res.status(204).send();
});
