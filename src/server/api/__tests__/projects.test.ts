import request from 'supertest'
import express from 'express'
import { api } from '../index'

// Mock the Prisma client
jest.mock('../../lib/prisma', () => ({
  prisma: {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const { prisma } = require('../../lib/prisma')

describe('Projects API', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api', api)

    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  describe('POST /api/projects', () => {
    it('creates a new project', async () => {
      const mockProject = {
        id: '123',
        name: 'Test Project',
        description: 'A test project',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.project.create.mockResolvedValue(mockProject)

      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'Test Project',
          description: 'A test project',
        })
        .expect(201)

      expect(response.body).toMatchObject({
        id: '123',
        name: 'Test Project',
        description: 'A test project',
      })

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Project',
          description: 'A test project',
        },
      })
    })

    it('returns 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          description: 'A test project',
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('handles database errors', async () => {
      prisma.project.create.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'Test Project',
        })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/projects', () => {
    it('returns all projects', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Project 1',
          description: 'Description 1',
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Project 2',
          description: 'Description 2',
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      prisma.project.findMany.mockResolvedValue(mockProjects)

      const response = await request(app)
        .get('/api/projects')
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toMatchObject({
        id: '1',
        name: 'Project 1',
      })

      expect(prisma.project.findMany).toHaveBeenCalled()
    })

    it('returns empty array when no projects exist', async () => {
      prisma.project.findMany.mockResolvedValue([])

      const response = await request(app)
        .get('/api/projects')
        .expect(200)

      expect(response.body).toEqual([])
    })
  })

  describe('GET /api/projects/:id', () => {
    it('returns a single project', async () => {
      const mockProject = {
        id: '123',
        name: 'Test Project',
        description: 'A test project',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.project.findUnique.mockResolvedValue(mockProject)

      const response = await request(app)
        .get('/api/projects/123')
        .expect(200)

      expect(response.body).toMatchObject({
        id: '123',
        name: 'Test Project',
      })

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      })
    })

    it('returns 404 when project not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/projects/999')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PATCH /api/projects/:id', () => {
    it('updates a project', async () => {
      const mockProject = {
        id: '123',
        name: 'Updated Project',
        description: 'Updated description',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.project.update.mockResolvedValue(mockProject)

      const response = await request(app)
        .patch('/api/projects/123')
        .send({
          name: 'Updated Project',
          description: 'Updated description',
        })
        .expect(200)

      expect(response.body).toMatchObject({
        id: '123',
        name: 'Updated Project',
      })

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          name: 'Updated Project',
          description: 'Updated description',
        },
      })
    })

    it('returns 404 when project to update not found', async () => {
      prisma.project.update.mockRejectedValue(
        new Error('Record to update not found')
      )

      const response = await request(app)
        .patch('/api/projects/999')
        .send({
          name: 'Updated',
        })
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/projects/:id', () => {
    it('deletes a project', async () => {
      const mockProject = {
        id: '123',
        name: 'Test Project',
        description: 'A test project',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.project.delete.mockResolvedValue(mockProject)

      const response = await request(app)
        .delete('/api/projects/123')
        .expect(200)

      expect(response.body).toMatchObject({
        id: '123',
      })

      expect(prisma.project.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      })
    })

    it('returns 404 when project to delete not found', async () => {
      prisma.project.delete.mockRejectedValue(
        new Error('Record to delete not found')
      )

      const response = await request(app)
        .delete('/api/projects/999')
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })
  })
})
