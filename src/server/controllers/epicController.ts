import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import type { CreateEpicInput, UpdateEpicInput } from '../lib/validations';

export const getEpics = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const projectId = req.query.projectId as string;
  const status = req.query.status as string;
  const priority = req.query.priority as string;

  const where: any = {};
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [epics, total] = await Promise.all([
    prisma.epic.findMany({
      where,
      skip,
      take: limit,
      include: {
        project: {
          select: { id: true, name: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.epic.count({ where }),
  ]);

  res.json({
    data: epics,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getEpicById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const epic = await prisma.epic.findUnique({
    where: { id },
    include: {
      project: {
        select: { id: true, name: true },
      },
      tasks: {
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { dependencies: true, dependents: true, comments: true },
          },
        },
        orderBy: { priority: 'desc' },
      },
    },
  });

  if (!epic) {
    throw new ApiError(404, 'Epic not found');
  }

  res.json({ data: epic });
});

export const createEpic = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateEpicInput = req.body;

  const epic = await prisma.epic.create({
    data: input,
    include: {
      project: {
        select: { id: true, name: true },
      },
    },
  });

  res.status(201).json({ data: epic });
});

export const updateEpic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input: UpdateEpicInput = req.body;

  const epic = await prisma.epic.update({
    where: { id },
    data: input,
    include: {
      project: {
        select: { id: true, name: true },
      },
    },
  });

  res.json({ data: epic });
});

export const deleteEpic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.epic.delete({
    where: { id },
  });

  res.status(204).send();
});
