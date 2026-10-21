const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // 1. Seed Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const teacherPassword = await bcrypt.hash("teacher123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@college.edu" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@college.edu",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@college.edu" },
    update: {},
    create: {
      name: "Dr. Faculty",
      email: "teacher@college.edu",
      passwordHash: teacherPassword,
      role: "TEACHER",
    },
  });

  // 2. Seed Departments
  const departments = [
    { name: "Computer Science Engineering", code: "CSE" },
    { name: "Information Technology", code: "IT" },
    { name: "Electronics & Telecommunication Engineering", code: "ENTC" },
    { name: "Mechanical Engineering", code: "MECH" },
    { name: "Civil Engineering", code: "CIVIL" },
    { name: "Electrical Engineering", code: "ELEC" },
    { name: "Artificial Intelligence & Data Science", code: "AIDS" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }

  // 3. Seed Teacher
  const cseDept = await prisma.department.findUnique({ where: { code: "CSE" } });
  const teacher = await prisma.teacher.upsert({
    where: { email: "teacher@college.edu" },
    update: {},
    create: {
      name: "Dr. Faculty",
      email: "teacher@college.edu",
    },
  });

  // 4. Seed Program Outcomes (PO1 to PO12)
  const pos = [
    { code: "PO1", statement: "Engineering Knowledge: Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization." },
    { code: "PO2", statement: "Problem Analysis: Identify, formulate, review research literature, and analyze complex engineering problems." },
    { code: "PO3", statement: "Design/Development of Solutions: Design solutions for complex engineering problems and design system components or processes." },
    { code: "PO4", statement: "Conduct Investigations of Complex Problems: Use research-based knowledge and research methods including design of experiments." },
    { code: "PO5", statement: "Modern Tool Usage: Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools." },
    { code: "PO6", statement: "The Engineer and Society: Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues." },
    { code: "PO7", statement: "Environment and Sustainability: Understand the impact of the professional engineering solutions in societal and environmental contexts." },
    { code: "PO8", statement: "Ethics: Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice." },
    { code: "PO9", statement: "Individual and Team Work: Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings." },
    { code: "PO10", statement: "Communication: Communicate effectively on complex engineering activities with the engineering community and with society at large." },
    { code: "PO11", statement: "Project Management and Finance: Demonstrate knowledge and understanding of the engineering and management principles and apply these to one’s own work." },
    { code: "PO12", statement: "Life-long Learning: Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change." },
  ];

  for (const po of pos) {
    await prisma.programOutcome.upsert({
      where: { code: po.code },
      update: { statement: po.statement },
      create: po,
    });
  }

  // 5. Seed Program Specific Outcomes (PSO1 to PSO3)
  const psos = [
    { code: "PSO1", statement: "Professional Skills: Ability to implement computer algorithms, software systems, and data pipelines to solve engineering challenges." },
    { code: "PSO2", statement: "Problem-Solving Skills: Ability to design secure, scalable, and optimized computing solutions using modern tools." },
    { code: "PSO3", statement: "Successful Career & Entrepreneurship: Understanding the modern technological trends to practice as a computing professional or innovator." },
  ];

  for (const pso of psos) {
    await prisma.programSpecificOutcome.upsert({
      where: { code: pso.code },
      update: { statement: pso.statement },
      create: pso,
    });
  }

  // 6. Seed Sample Subject & Course Outcomes
  const subject = await prisma.subject.upsert({
    where: { code: "CS501" },
    update: {},
    create: {
      code: "CS501",
      name: "Database Management Systems",
      semester: 5,
      academicYear: "2025-26",
      teacherId: teacher.id,
      departmentId: cseDept.id,
    },
  });

  const cos = [
    { code: "CO1", statement: "Understand fundamental database concepts and relational models." },
    { code: "CO2", statement: "Formulate SQL queries, relational algebra, and calculus expressions." },
    { code: "CO3", statement: "Design database schemas using normalization and ER modeling techniques." },
    { code: "CO4", statement: "Implement transaction management, ACID properties, and concurrency control." },
    { code: "CO5", statement: "Demonstrate indexing, hashing, query evaluation and query optimization." },
    { code: "CO6", statement: "Develop data-driven software solutions integrating modern database architectures." },
  ];

  for (const co of cos) {
    await prisma.courseOutcome.upsert({
      where: {
        subjectId_code: {
          subjectId: subject.id,
          code: co.code,
        },
      },
      update: { statement: co.statement },
      create: {
        ...co,
        subjectId: subject.id,
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
