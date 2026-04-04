import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a default admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN",
    },
  });

  console.log("✅ Created admin user:", admin.email);

  // Create a sample project
  const project = await prisma.project.upsert({
    where: { id: "sample-project" },
    update: {},
    create: {
      id: "sample-project",
      name: "Sample Project",
      description: "A sample project to demonstrate the Task Decomposition Tool",
      ownerId: admin.id,
      status: "ACTIVE",
    },
  });

  console.log("✅ Created project:", project.name);

  // Create sample epics
  const epic1 = await prisma.epic.create({
    data: {
      projectId: project.id,
      title: "User Authentication",
      description: "Implement user authentication and authorization",
      status: "IN_PROGRESS",
      priority: "HIGH",
    },
  });

  const epic2 = await prisma.epic.create({
    data: {
      projectId: project.id,
      title: "Dashboard",
      description: "Build the main dashboard interface",
      status: "BACKLOG",
      priority: "MEDIUM",
    },
  });

  console.log("✅ Created sample epics");

  // Create sample tasks
  const task1 = await prisma.task.create({
    data: {
      epicId: epic1.id,
      title: "Design login form",
      description: "Create UI mockups for the login form",
      status: "DONE",
      priority: "HIGH",
      storyPoints: 3,
      estimatedHours: 4,
      actualHours: 3.5,
      assigneeId: admin.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      epicId: epic1.id,
      title: "Implement JWT authentication",
      description: "Set up JWT-based authentication API",
      status: "IN_PROGRESS",
      priority: "HIGH",
      storyPoints: 5,
      estimatedHours: 8,
      assigneeId: admin.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      epicId: epic2.id,
      title: "Design dashboard layout",
      description: "Create wireframes for the main dashboard",
      status: "TODO",
      priority: "MEDIUM",
      storyPoints: 2,
      estimatedHours: 3,
    },
  });

  console.log("✅ Created sample tasks");

  // Create a dependency
  await prisma.dependency.create({
    data: {
      taskId: task2.id,
      dependsOnTaskId: task1.id,
      type: "BLOCKS",
    },
  });

  console.log("✅ Created sample dependency");

  // Create a sample task link
  await prisma.taskLink.create({
    data: {
      taskId: task1.id,
      url: "https://confluence.example.com/login-design",
      linkType: "CONFLUENCE",
      title: "Login Design Specs",
    },
  });

  console.log("✅ Created sample task link");

  // Create a sample comment
  await prisma.comment.create({
    data: {
      taskId: task1.id,
      authorId: admin.id,
      content: "Design approved by stakeholders. Ready to implement.",
    },
  });

  console.log("✅ Created sample comment");
  console.log("🎉 Seed complete!");
}

main()
  .catch(e => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
