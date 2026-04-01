import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import type { CreateTaskInput, UpdateTaskInput } from '../lib/validations';

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const epicId = req.query.epicId as string;
  const assigneeId = req.query.assigneeId as string;
  const status = req.query.status as string;
  const priority = req.query.priority as string;

  const where: any = {};
  if (epicId) where.epicId = epicId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      include: {
        epic: {
          select: { id: true, title: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { dependencies: true, dependents: true, comments: true, links: true },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.task.count({ where }),
  ]);

  res.json({
    data: tasks,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      epic: {
        select: { id: true, title: true, project: { select: { id: true, name: true } } },
      },
      assignee: {
        select: { id: true, name: true, email: true },
      },
      dependencies: {
        include: {
          dependsOn: {
            select: { id: true, title: true, status: true },
          },
        },
      },
      dependents: {
        include: {
          task: {
            select: { id: true, title: true, status: true },
          },
        },
      },
      links: true,
      comments: {
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  res.json({ data: task });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateTaskInput = req.body;

  const task = await prisma.task.create({
    data: input,
    include: {
      epic: {
        select: { id: true, title: true },
      },
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  res.status(201).json({ data: task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input: UpdateTaskInput = req.body;

  // If status is being changed to DONE, set completedAt
  const data: any = { ...input };
  if (input.status === 'DONE' && !input.completedAt) {
    data.completedAt = new Date();
  } else if (input.status && input.status !== 'DONE') {
    data.completedAt = null;
  }

  const task = await prisma.task.update({
    where: { id },
    data,
    include: {
      epic: {
        select: { id: true, title: true },
      },
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  res.json({ data: task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.task.delete({
    where: { id },
  });

  res.status(204).send();
});

export const getTaskDependencies = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const dependencies = await prisma.dependency.findMany({
    where: { taskId: id },
    include: {
      dependsOn: {
        select: { id: true, title: true, status: true, assignee: { select: { id: true, name: true } } },
      },
    },
  });

  res.json({ data: dependencies });
});

export const createDependency = asyncHandler(async (req: Request, res: Response) => {
  const { taskId, dependsOnTaskId, type } = req.body;

  // Check for circular dependencies
  if (taskId === dependsOnTaskId) {
    throw new ApiError(400, 'Task cannot depend on itself');
  }

  // Check if dependency already exists
  const existing = await prisma.dependency.findUnique({
    where: {
      taskId_dependsOnTaskId: {
        taskId,
        dependsOnTaskId,
      },
    },
  });

  if (existing) {
    throw new ApiError(400, 'Dependency already exists');
  }

  const dependency = await prisma.dependency.create({
    data: {
      taskId,
      dependsOnTaskId,
      type: type || 'BLOCKS',
    },
    include: {
      task: { select: { id: true, title: true } },
      dependsOn: { select: { id: true, title: true } },
    },
  });

  res.status(201).json({ data: dependency });
});

export const deleteDependency = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.dependency.delete({
    where: { id },
  });

  res.status(204).send();
});
