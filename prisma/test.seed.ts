import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test database...')

  // Clean existing data
  await prisma.comment.deleteMany()
  await prisma.taskDependency.deleteMany()
  await prisma.task.deleteMany()
  await prisma.epic.deleteMany()
  await prisma.project.deleteMany()

  // Create test project
  const project = await prisma.project.create({
    data: {
      name: 'Test Project',
      description: 'A project for testing purposes',
      status: 'active',
    },
  })

  console.log('✅ Created project:', project.id)

  // Create test epic
  const epic = await prisma.epic.create({
    data: {
      title: 'Test Epic',
      description: 'An epic for testing',
      status: 'todo',
      priority: 'medium',
      projectId: project.id,
    },
  })

  console.log('✅ Created epic:', epic.id)

  // Create test tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Test Task 1',
      description: 'First test task',
      status: 'todo',
      priority: 'high',
      epicId: epic.id,
      projectId: project.id,
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Test Task 2',
      description: 'Second test task',
      status: 'in_progress',
      priority: 'medium',
      epicId: epic.id,
      projectId: project.id,
    },
  })

  const task3 = await prisma.task.create({
    data: {
      title: 'Test Task 3',
      description: 'Third test task',
      status: 'done',
      priority: 'low',
      epicId: epic.id,
      projectId: project.id,
    },
  })

  console.log('✅ Created tasks:', task1.id, task2.id, task3.id)

  // Create test dependency
  await prisma.taskDependency.create({
    data: {
      blockingTaskId: task1.id,
      dependentTaskId: task2.id,
    },
  })

  console.log('✅ Created dependency: Task 1 → Task 2')

  // Create test comments
  await prisma.comment.create({
    data: {
      content: 'This is a test comment',
      taskId: task1.id,
    },
  })

  console.log('✅ Created comment')

  console.log('🎉 Test database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
