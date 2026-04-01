/**
 * @jest-environment node
 */

import { Request, Response, NextFunction } from 'express'
import { getTasks, getTaskById, createTask, updateTask, deleteTask } from '../taskController'
import { ApiError } from '../../middleware/errorHandler'
import prisma from '../../lib/prisma'

// Get references to the mocked functions
const mockTaskFindMany = prisma.task.findMany as jest.Mock
const mockTaskFindUnique = prisma.task.findUnique as jest.Mock
const mockTaskCreate = prisma.task.create as jest.Mock
const mockTaskUpdate = prisma.task.update as jest.Mock
const mockTaskDelete = prisma.task.delete as jest.Mock
const mockTaskCount = prisma.task.count as jest.Mock

// Mock the Prisma client with inline functions
jest.mock('../../lib/prisma', () => {
  const mockTaskFindMany = jest.fn()
  const mockTaskFindUnique = jest.fn()
  const mockTaskCreate = jest.fn()
  const mockTaskUpdate = jest.fn()
  const mockTaskDelete = jest.fn()
  const mockTaskCount = jest.fn()

  return {
    __esModule: true,
    default: {
      task: {
        findMany: mockTaskFindMany,
        findUnique: mockTaskFindUnique,
        create: mockTaskCreate,
        update: mockTaskUpdate,
        delete: mockTaskDelete,
        count: mockTaskCount,
      },
    },
    prisma: {
      task: {
        findMany: mockTaskFindMany,
        findUnique: mockTaskFindUnique,
        create: mockTaskCreate,
        update: mockTaskUpdate,
        delete: mockTaskDelete,
        count: mockTaskCount,
      },
    },
  }
})

// Mock response object
const mockResponse = () => {
  const res: Partial<Response> = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  }
  return res as Response
}

describe('Task Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTasks', () => {
    it('returns tasks with pagination', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          status: 'TODO',
          epic: { id: 'epic-1', title: 'Test Epic' },
          assignee: null,
          _count: { dependencies: 0, dependents: 0, comments: 0, links: 0 },
        },
        {
          id: '2',
          title: 'Task 2',
          status: 'DONE',
          epic: { id: 'epic-1', title: 'Test Epic' },
          assignee: null,
          _count: { dependencies: 0, dependents: 0, comments: 0, links: 0 },
        },
      ]

      mockTaskFindMany.mockResolvedValue(mockTasks)
      mockTaskCount.mockResolvedValue(2)

      const req = {
        query: { page: '1', limit: '10' },
      } as unknown as Request

      const res = mockResponse()

      await getTasks(req, res, jest.fn() as NextFunction)

      expect(res.json).toHaveBeenCalledWith({
        data: mockTasks,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      })
    })

    it('filters tasks by epicId', async () => {
      mockTaskFindMany.mockResolvedValue([])
      mockTaskCount.mockResolvedValue(0)

      const req = {
        query: { epicId: 'epic-1' },
      } as unknown as Request

      const res = mockResponse()

      await getTasks(req, res, jest.fn() as NextFunction)

      expect(mockTaskFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            epicId: 'epic-1',
          }),
        })
      )
    })

    it('filters tasks by status', async () => {
      mockTaskFindMany.mockResolvedValue([])
      mockTaskCount.mockResolvedValue(0)

      const req = {
        query: { status: 'TODO' },
      } as unknown as Request

      const res = mockResponse()

      await getTasks(req, res, jest.fn() as NextFunction)

      expect(mockTaskFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'TODO',
          }),
        })
      )
    })

    it('filters tasks by assigneeId', async () => {
      mockTaskFindMany.mockResolvedValue([])
      mockTaskCount.mockResolvedValue(0)

      const req = {
        query: { assigneeId: 'user-1' },
      } as unknown as Request

      const res = mockResponse()

      await getTasks(req, res, jest.fn() as NextFunction)

      expect(mockTaskFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assigneeId: 'user-1',
          }),
        })
      )
    })

    it('searches tasks by title and description', async () => {
      mockTaskFindMany.mockResolvedValue([])
      mockTaskCount.mockResolvedValue(0)

      const req = {
        query: { search: 'test' },
      } as unknown as Request

      const res = mockResponse()

      await getTasks(req, res, jest.fn() as NextFunction)

      expect(mockTaskFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
            ],
          }),
        })
      )
    })
  })

  describe('getTaskById', () => {
    it('returns a single task by ID', async () => {
      const mockTask = {
        id: '123',
        title: 'Test Task',
        status: 'TODO',
        epic: {
          id: 'epic-1',
          title: 'Test Epic',
          project: { id: 'project-1', name: 'Test Project' },
        },
        assignee: null,
        dependencies: [],
        dependents: [],
        links: [],
        comments: [],
      }

      mockTaskFindUnique.mockResolvedValue(mockTask)

      const req = {
        params: { id: '123' },
      } as unknown as Request

      const res = mockResponse()

      await getTaskById(req, res, jest.fn() as NextFunction)

      expect(res.json).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        data: mockTask,
      })
    })

    it('throws 404 when task not found', async () => {
      mockTaskFindUnique.mockResolvedValue(null)

      const req = {
        params: { id: 'nonexistent' },
      } as unknown as Request

      const res = mockResponse()
      const next = jest.fn() as unknown as NextFunction

      await expect(getTaskById(req, res, next)).rejects.toThrow(ApiError)
    })
  })

  describe('createTask', () => {
    it('creates a new task', async () => {
      const mockTask = {
        id: '123',
        title: 'Test Task',
        status: 'TODO',
        epicId: 'epic-1',
        epic: { id: 'epic-1', title: 'Test Epic' },
        assignee: null,
      }

      mockTaskCreate.mockResolvedValue(mockTask)

      const req = {
        body: {
          title: 'Test Task',
          epicId: 'epic-1',
        },
      } as unknown as Request

      const res = mockResponse()

      await createTask(req, res, jest.fn() as NextFunction)

      expect(mockTaskCreate).toHaveBeenCalledWith({
        data: {
          title: 'Test Task',
          epicId: 'epic-1',
        },
        include: {
          epic: { select: { id: true, title: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      })

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        data: mockTask,
      })
    })
  })

  describe('updateTask', () => {
    it('updates a task', async () => {
      const mockTask = {
        id: '123',
        title: 'Test Task',
        status: 'IN_PROGRESS',
        epicId: 'epic-1',
        epic: { id: 'epic-1', title: 'Test Epic' },
        assignee: null,
      }

      mockTaskUpdate.mockResolvedValue(mockTask)

      const req = {
        params: { id: '123' },
        body: {
          status: 'IN_PROGRESS',
        },
      } as unknown as Request

      const res = mockResponse()

      await updateTask(req, res, jest.fn() as NextFunction)

      expect(mockTaskUpdate).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          status: 'IN_PROGRESS',
          completedAt: null,
        },
        include: {
          epic: { select: { id: true, title: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      })

      expect(res.json).toHaveBeenCalledWith({
        data: mockTask,
      })
    })

    it('sets completedAt when status changes to DONE', async () => {
      const mockTask = {
        id: '123',
        title: 'Test Task',
        status: 'DONE',
        completedAt: new Date(),
        epicId: 'epc-1',
        epic: { id: 'epic-1', title: 'Test Epic' },
        assignee: null,
      }

      mockTaskUpdate.mockResolvedValue(mockTask)

      const req = {
        params: { id: '123' },
        body: {
          status: 'DONE',
        },
      } as unknown as Request

      const res = mockResponse()

      await updateTask(req, res, jest.fn() as NextFunction)

      expect(mockTaskUpdate).toHaveBeenCalledWith({
        where: { id: '123' },
        data: expect.objectContaining({
          status: 'DONE',
          completedAt: expect.any(Date),
        }),
        include: expect.anything(),
      })
    })
  })

  describe('deleteTask', () => {
    it('deletes a task', async () => {
      mockTaskDelete.mockResolvedValue({ id: '123' })

      const req = {
        params: { id: '123' },
      } as unknown as Request

      const res = mockResponse()

      await deleteTask(req, res, jest.fn() as NextFunction)

      expect(mockTaskDelete).toHaveBeenCalledWith({
        where: { id: '123' },
      })

      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.send).toHaveBeenCalled()
    })
  })
})
