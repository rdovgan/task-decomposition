import { PrismaClient } from '@prisma/client'

/**
 * Test database utilities
 */

// Note: In Prisma v7+, datasource URLs are configured through environment variables
// For tests, set process.env.DATABASE_URL before importing
if (!process.env.DATABASE_URL && process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
}

export const testPrisma = new PrismaClient()

/**
 * Clean all test data
 */
export async function cleanupTestData() {
  await testPrisma.comment.deleteMany()
  await testPrisma.dependency.deleteMany()
  await testPrisma.task.deleteMany()
  await testPrisma.epic.deleteMany()
  await testPrisma.project.deleteMany()
}

/**
 * Create a test project
 */
export async function createTestProject(data?: {
  name?: string
  description?: string
  status?: 'ACTIVE' | 'ARCHIVED' | 'ON_HOLD'
  ownerId?: string
}) {
  return testPrisma.project.create({
    data: {
      name: data?.name || 'Test Project',
      description: data?.description || 'Test project description',
      status: data?.status || 'ACTIVE',
      ownerId: data?.ownerId || 'test-user-id',
    },
  })
}

/**
 * Create a test epic
 */
export async function createTestEpic(projectId: string, data?: {
  title?: string
  description?: string
  status?: 'BACKLOG' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}) {
  return testPrisma.epic.create({
    data: {
      title: data?.title || 'Test Epic',
      description: data?.description || 'Test epic description',
      status: data?.status || 'BACKLOG',
      priority: data?.priority || 'MEDIUM',
      projectId,
    },
  })
}

/**
 * Create a test task
 */
export async function createTestTask(epicId: string, data?: {
  title?: string
  description?: string
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED' | 'CANCELLED'
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}) {
  return testPrisma.task.create({
    data: {
      title: data?.title || 'Test Task',
      description: data?.description || 'Test task description',
      status: data?.status || 'TODO',
      priority: data?.priority || 'MEDIUM',
      epicId,
    },
  })
}

/**
 * Disconnect test database
 */
export async function disconnectTestDatabase() {
  await testPrisma.$disconnect()
}
