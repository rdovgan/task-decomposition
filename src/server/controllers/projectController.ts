import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import type { CreateProjectInput, UpdateProjectInput } from '../lib/validations';

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status as string;
  const ownerId = req.query.ownerId as string;

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
      orderBy: { updatedAt: 'desc' },
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
  const { id } = req.params;

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
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    throw new ApiError(404, 'Project not found');
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
  const { id } = req.params;
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
  const { id } = req.params;

  await prisma.project.delete({
    where: { id },
  });

  res.status(204).send();
});
