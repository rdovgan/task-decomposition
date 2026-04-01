import request from 'supertest'
import express from 'express'
import { api } from '../index'

// Mock the Prisma client
jest.mock('../../lib/prisma', () => ({
  prisma: {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const { prisma } = require('../../lib/prisma')

describe('Tasks API', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api', api)
    jest.clearAllMocks()
  })

  describe('POST /api/tasks', () => {
    it('creates a new task', async () => {
      const mockTask = {
        id: '123',
        title: 'Test Task',
        description: 'A test task',
        status: 'TODO',
        priority: 'HIGH',
        epicId: 'epic-1',
        projectId: 'project-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.task.create.mockResolvedValue(mockTask)

      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'A test task',
          epicId: 'epic-1',
          projectId: 'project-1',
          priority: 'HIGH',
        })
        .expect(201)

      expect(response.body).toMatchObject({
        id: '123',
        title: 'Test Task',
        status: 'TODO',
      })

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Task',
          description: 'A test task',
          epicId: 'epic-1',
          projectId: 'project-1',
          priority: 'HIGH',
        },
      })
    })

    it('returns 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          description: 'A test task',
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/tasks', () => {
    it('returns all tasks for a project', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          status: 'TODO',
          priority: 'HIGH',
          projectId: 'project-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Task 2',
          status: 'DONE',
          priority: 'LOW',
          projectId: 'project-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      prisma.task.findMany.mockResolvedValue(mockTasks)

      const response = await request(app)
        .get('/api/tasks?projectId=project-1')
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { projectId: 'project-1' },
      })
    })
  })

  describe('PATCH /api/tasks/:id', () => {
    it('updates task status', async () => {
      const mockTask = {
        id: '123',
        title: 'Test Task',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.task.update.mockResolvedValue(mockTask)

      const response = await request(app)
        .patch('/api/tasks/123')
        .send({
          status: 'IN_PROGRESS',
        })
        .expect(200)

      expect(response.body).toMatchObject({
        id: '123',
        status: 'IN_PROGRESS',
      })

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          status: 'IN_PROGRESS',
        },
      })
    })

    it('updates task priority', async () => {
      const mockTask = {
        id: '123',
        title: 'Test Task',
        status: 'TODO',
        priority: 'CRITICAL',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.task.update.mockResolvedValue(mockTask)

      const response = await request(app)
        .patch('/api/tasks/123')
        .send({
          priority: 'CRITICAL',
        })
        .expect(200)

      expect(response.body).toMatchObject({
        priority: 'CRITICAL',
      })
    })
  })

  describe('DELETE /api/tasks/:id', () => {
    it('deletes a task', async () => {
      const mockTask = {
        id: '123',
        title: 'Test Task',
        status: 'TODO',
        priority: 'HIGH',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.task.delete.mockResolvedValue(mockTask)

      const response = await request(app)
        .delete('/api/tasks/123')
        .expect(200)

      expect(response.body).toMatchObject({
        id: '123',
      })

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      })
    })
  })
})
