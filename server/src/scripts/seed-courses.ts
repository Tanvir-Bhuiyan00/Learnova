import { CourseLevel, CourseStatus, UserRole } from "../generated/prisma/enums";
import { auth } from "../app/lib/auth";
import { prisma } from "../app/lib/prisma";

const DEMO_CATEGORIES = [
  { title: "Web Development", description: "Build modern web applications." },
  { title: "Data Science", description: "Analyze data and build ML models." },
  { title: "UI/UX Design", description: "Design delightful digital products." },
];

const DEMO_COURSES = [
  {
    title: "Complete Web Development Bootcamp",
    description:
      "Go from zero to building full-stack applications with HTML, CSS, JavaScript and Node.js. Includes hands-on projects and real-world best practices.",
    price: 2499,
    discountPrice: 1499,
    level: CourseLevel.BEGINNER,
    category: "Web Development",
    seed: "learnova-webdev",
    modules: [
      {
        title: "Frontend Foundations",
        description: "HTML, CSS and the building blocks of the web.",
        lessons: [
          {
            title: "HTML in 60 Minutes",
            description: "Learn semantic HTML structure.",
            duration: 18,
            isFree: true,
          },
          {
            title: "Styling with Modern CSS",
            description: "Flexbox, Grid and custom properties.",
            duration: 25,
            isFree: true,
          },
        ],
      },
      {
        title: "JavaScript Fundamentals",
        description: "The language of the browser.",
        lessons: [
          {
            title: "Variables, Types & Functions",
            description: "Core JavaScript syntax.",
            duration: 30,
            isFree: false,
          },
          {
            title: "DOM Manipulation",
            description: "Make pages interactive.",
            duration: 22,
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    title: "React & Next.js Masterclass",
    description:
      "Master modern React with hooks, server components and Next.js App Router. Ship production-grade applications with confidence.",
    price: 2999,
    discountPrice: 1999,
    level: CourseLevel.INTERMEDIATE,
    category: "Web Development",
    seed: "learnova-react",
    modules: [
      {
        title: "React Core",
        description: "Components, state and effects.",
        lessons: [
          {
            title: "Thinking in Components",
            description: "Composition and props.",
            duration: 20,
            isFree: true,
          },
          {
            title: "State Management with Hooks",
            description: "useState, useReducer and context.",
            duration: 28,
            isFree: false,
          },
        ],
      },
      {
        title: "Next.js App Router",
        description: "Server components and routing.",
        lessons: [
          {
            title: "File-Based Routing",
            description: "Pages, layouts and routes.",
            duration: 24,
            isFree: false,
          },
          {
            title: "Data Fetching Patterns",
            description: "Server components and streaming.",
            duration: 26,
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    title: "Python for Data Science",
    description:
      "Learn Python, NumPy, pandas and data visualization. Build real data projects from raw datasets to insights.",
    price: 2199,
    discountPrice: 1299,
    level: CourseLevel.BEGINNER,
    category: "Data Science",
    seed: "learnova-python",
    modules: [
      {
        title: "Python Essentials",
        description: "Start coding in Python.",
        lessons: [
          {
            title: "Getting Started with Python",
            description: "Setup, syntax and data types.",
            duration: 20,
            isFree: true,
          },
          {
            title: "Working with pandas",
            description: "DataFrames and data wrangling.",
            duration: 32,
            isFree: false,
          },
        ],
      },
      {
        title: "Visualization",
        description: "Tell stories with data.",
        lessons: [
          {
            title: "Matplotlib & Seaborn",
            description: "Charts that communicate.",
            duration: 27,
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    title: "UI/UX Design Fundamentals",
    description:
      "Learn user research, wireframing and visual design. Create interfaces people love to use.",
    price: 1799,
    discountPrice: 999,
    level: CourseLevel.ALL_LEVELS,
    category: "UI/UX Design",
    seed: "learnova-design",
    modules: [
      {
        title: "Design Thinking",
        description: "Empathize, define, ideate.",
        lessons: [
          {
            title: "User Research Basics",
            description: "Interviews and personas.",
            duration: 21,
            isFree: true,
          },
          {
            title: "Wireframing & Prototyping",
            description: "From sketches to clickable prototypes.",
            duration: 29,
            isFree: false,
          },
        ],
      },
    ],
  },
];

const getOrCreateInstructor = async () => {
  const existing = await prisma.instructor.findFirst({
    where: { isDeleted: false },
  });

  if (existing) {
    return existing;
  }

  const email = "demo.instructor@learnova.test";
  const data = await auth.api.signUpEmail({
    body: {
      email,
      password: "DemoInstructor123!",
      name: "Demo Instructor",
      role: UserRole.INSTRUCTOR,
      needPasswordChange: false,
      rememberMe: false,
    },
  });

  const instructor = await prisma.instructor.create({
    data: {
      userId: data.user.id,
      name: "Demo Instructor",
      email,
      bio: "Passionate educator building hands-on courses.",
      qualification: "MSc Computer Science",
      experience: 8,
      designation: "Senior Software Engineer",
      currentWorkingPlace: "Learnova Academy",
    },
  });

  console.log("Created demo instructor:", instructor.email);
  return instructor;
};

const seedDemoCourses = async () => {
  const instructor = await getOrCreateInstructor();

  for (const category of DEMO_CATEGORIES) {
    await prisma.category.upsert({
      where: { title: category.title },
      update: { isDeleted: false },
      create: category,
    });
  }

  const created = [];

  for (const courseData of DEMO_COURSES) {
    const existingCourse = await prisma.course.findFirst({
      where: { title: courseData.title },
    });

    if (existingCourse) {
      console.log(`Skipping existing course: ${courseData.title}`);
      continue;
    }

    const category = await prisma.category.findUniqueOrThrow({
      where: { title: courseData.category },
    });

    const totalLessons = courseData.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );
    const totalDuration = courseData.modules.reduce(
      (sum, module) =>
        sum +
        module.lessons.reduce(
          (lessonSum, lesson) => lessonSum + (lesson.duration || 0),
          0,
        ),
      0,
    );

    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        thumbnail: `https://picsum.photos/seed/${courseData.seed}/800/450`,
        price: courseData.price,
        discountPrice: courseData.discountPrice,
        level: courseData.level,
        status: CourseStatus.PUBLISHED,
        categoryId: category.id,
        instructorId: instructor.id,
        totalLessons,
        totalDuration,
        averageRating: 4.5,
        totalStudents: 0,
        modules: {
          create: courseData.modules.map((module, moduleIndex) => ({
            title: module.title,
            description: module.description,
            order: moduleIndex + 1,
            lessons: {
              create: module.lessons.map((lesson, lessonIndex) => ({
                title: lesson.title,
                description: lesson.description,
                videoDuration: lesson.duration,
                order: lessonIndex + 1,
                isFree: lesson.isFree,
                content:
                  "This is a demo lesson body. Add rich learning content here.",
              })),
            },
          })),
        },
      },
    });

    created.push(course.title);
    console.log(`Seeded course: ${course.title}`);
  }

  if (created.length === 0) {
    console.log("No new courses to seed. All demo courses already exist.");
  } else {
    console.log(`Done. Seeded ${created.length} course(s).`);
  }
};

seedDemoCourses()
  .catch((error) => {
    console.error("Failed to seed demo courses:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
