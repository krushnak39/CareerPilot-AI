const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Layer 2 seed...");

  // =========================
  // SKILLS
  // =========================

  const skills = [
    { name: "JavaScript", category: "Programming" },
    { name: "React", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "Python", category: "Programming" },
    { name: "SQL", category: "Database" },
    { name: "Git", category: "Tools" },
    { name: "REST APIs", category: "Backend" },
    { name: "Data Structures", category: "Computer Science" },
    { name: "Problem Solving", category: "Soft Skills" },
    { name: "Communication", category: "Soft Skills" },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: {
        name: skill.name,
      },
      update: {
        category: skill.category,
      },
      create: {
        name: skill.name,
        category: skill.category,
      },
    });
  }

  console.log("✅ Skills inserted");

  // =========================
  // LEARNING RESOURCES
  // =========================

  const resources = [
    {
      title: "JavaScript Fundamentals",
      description:
        "Learn variables, functions, arrays, objects, and modern JavaScript concepts.",
      type: "course",
      provider: "CareerPilot AI",
      difficulty: "beginner",
      durationMin: 120,
      url: null,
    },
    {
      title: "React Fundamentals",
      description:
        "Learn components, props, state, hooks, and basic React application development.",
      type: "course",
      provider: "CareerPilot AI",
      difficulty: "beginner",
      durationMin: 150,
      url: null,
    },
    {
      title: "Node.js and Express",
      description:
        "Learn backend development using Node.js and Express REST APIs.",
      type: "course",
      provider: "CareerPilot AI",
      difficulty: "intermediate",
      durationMin: 180,
      url: null,
    },
    {
      title: "Python Programming",
      description:
        "Learn Python syntax, functions, collections, and programming fundamentals.",
      type: "course",
      provider: "CareerPilot AI",
      difficulty: "beginner",
      durationMin: 150,
      url: null,
    },
    {
      title: "SQL Fundamentals",
      description:
        "Learn relational databases, SELECT queries, filtering, joins, and aggregation.",
      type: "course",
      provider: "CareerPilot AI",
      difficulty: "beginner",
      durationMin: 120,
      url: null,
    },
    {
      title: "Git and GitHub Basics",
      description:
        "Learn version control, commits, branches, merging, and GitHub workflows.",
      type: "course",
      provider: "CareerPilot AI",
      difficulty: "beginner",
      durationMin: 90,
      url: null,
    },
    {
      title: "REST API Development",
      description:
        "Understand HTTP methods, API endpoints, authentication, and JSON responses.",
      type: "course",
      provider: "CareerPilot AI",
      difficulty: "intermediate",
      durationMin: 120,
      url: null,
    },
    {
      title: "Data Structures and Algorithms",
      description:
        "Practice arrays, strings, stacks, queues, searching, sorting, and algorithmic thinking.",
      type: "course",
      provider: "CareerPilot AI",
      difficulty: "intermediate",
      durationMin: 240,
      url: null,
    },
    {
      title: "Problem Solving Practice",
      description:
        "Develop structured problem-solving and logical reasoning skills.",
      type: "practice",
      provider: "CareerPilot AI",
      difficulty: "intermediate",
      durationMin: 90,
      url: null,
    },
    {
      title: "Technical Communication",
      description:
        "Improve technical explanations, interview communication, and professional communication.",
      type: "course",
      provider: "CareerPilot AI",
      difficulty: "beginner",
      durationMin: 90,
      url: null,
    },
  ];

  for (const resource of resources) {
    const existing = await prisma.learningResource.findFirst({
      where: {
        title: resource.title,
      },
    });

    if (existing) {
      await prisma.learningResource.update({
        where: {
          id: existing.id,
        },
        data: resource,
      });
    } else {
      await prisma.learningResource.create({
        data: resource,
      });
    }
  }

  console.log("✅ Learning resources inserted");

  // =========================
  // RESOURCE → SKILL LINKS
  // =========================

  const resourceSkillMap = {
    "JavaScript Fundamentals": ["JavaScript"],
    "React Fundamentals": ["React", "JavaScript"],
    "Node.js and Express": ["Node.js", "JavaScript"],
    "Python Programming": ["Python"],
    "SQL Fundamentals": ["SQL"],
    "Git and GitHub Basics": ["Git"],
    "REST API Development": ["REST APIs", "Node.js"],
    "Data Structures and Algorithms": [
      "Data Structures",
      "Problem Solving",
    ],
    "Problem Solving Practice": ["Problem Solving"],
    "Technical Communication": ["Communication"],
  };

  for (const [resourceTitle, skillNames] of Object.entries(
    resourceSkillMap
  )) {
    const resource = await prisma.learningResource.findFirst({
      where: {
        title: resourceTitle,
      },
    });

    if (!resource) continue;

    for (const skillName of skillNames) {
      const skill = await prisma.skill.findUnique({
        where: {
          name: skillName,
        },
      });

      if (!skill) continue;

      await prisma.learningResourceSkill.upsert({
        where: {
          resourceId_skillId: {
            resourceId: resource.id,
            skillId: skill.id,
          },
        },
        update: {},
        create: {
          resourceId: resource.id,
          skillId: skill.id,
        },
      });
    }
  }

  console.log("✅ Resource-skill relationships inserted");

  console.log("🎉 Layer 2 seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });