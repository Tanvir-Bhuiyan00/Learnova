import {
  CourseLevel,
  CourseStatus,
  PaymentStatus,
  UserRole,
} from "../generated/prisma/enums";
import { auth } from "../app/lib/auth";
import { prisma } from "../app/lib/prisma";

const DEMO_CATEGORIES = [
  { title: "Web Development", description: "Build modern web applications." },
  { title: "Data Science", description: "Analyze data and build ML models." },
  { title: "UI/UX Design", description: "Design delightful digital products." },
];

const DEMO_INSTRUCTORS = [
  {
    email: "demo.instructor@learnova.test",
    password: "DemoInstructor123!",
    name: "Ayesha Rahman",
    bio: "Full-stack engineer who has shipped production apps for over a decade. Passionate about teaching real-world development.",
    qualification: "MSc Computer Science",
    experience: 10,
    designation: "Senior Software Engineer",
    currentWorkingPlace: "Learnova Academy",
  },
  {
    email: "sarah.mitchell@learnova.test",
    password: "DemoInstructor123!",
    name: "Sarah Mitchell",
    bio: "Frontend architect and design systems lead. I turn complex UI concepts into lessons anyone can follow.",
    qualification: "BSc Computer Science",
    experience: 7,
    designation: "Frontend Architect",
    currentWorkingPlace: "Pixelworks Studio",
  },
  {
    email: "david.chen@learnova.test",
    password: "DemoInstructor123!",
    name: "David Chen",
    bio: "Data scientist with a PhD in machine learning. I teach Python, SQL and ML with a focus on practical intuition.",
    qualification: "PhD Machine Learning",
    experience: 12,
    designation: "Principal Data Scientist",
    currentWorkingPlace: "DataSphere Labs",
  },
];

const DEMO_STUDENTS = [
  {
    email: "learner.one@learnova.test",
    password: "DemoStudent123!",
    name: "Rahim Uddin",
  },
  {
    email: "learner.two@learnova.test",
    password: "DemoStudent123!",
    name: "Nusrat Jahan",
  },
  {
    email: "learner.three@learnova.test",
    password: "DemoStudent123!",
    name: "Tanvir Ahmed",
  },
  {
    email: "learner.four@learnova.test",
    password: "DemoStudent123!",
    name: "Farhana Islam",
  },
  {
    email: "learner.five@learnova.test",
    password: "DemoStudent123!",
    name: "Minhaj Karim",
  },
];

const COURSE_INSTRUCTOR: Record<string, string> = {
  "Complete Web Development Bootcamp": "demo.instructor@learnova.test",
  "Node.js & Express API Development": "demo.instructor@learnova.test",
  "React & Next.js Masterclass": "sarah.mitchell@learnova.test",
  "Figma for Product Design": "sarah.mitchell@learnova.test",
  "UI/UX Design Fundamentals": "sarah.mitchell@learnova.test",
  "Python for Data Science": "david.chen@learnova.test",
  "SQL & PostgreSQL Mastery": "david.chen@learnova.test",
  "Machine Learning with Python": "david.chen@learnova.test",
};

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
  {
    title: "Node.js & Express API Development",
    description:
      "Design and build scalable REST APIs with Node.js, Express and PostgreSQL. Covers authentication, validation and deployment.",
    price: 2299,
    discountPrice: 1399,
    level: CourseLevel.INTERMEDIATE,
    category: "Web Development",
    seed: "learnova-node",
    modules: [
      {
        title: "Node.js Foundations",
        description: "The runtime that powers the backend.",
        lessons: [
          {
            title: "Modules & Event Loop",
            description: "How Node.js actually works.",
            duration: 24,
            isFree: true,
          },
          {
            title: "Building an HTTP Server",
            description: "From zero to a working server.",
            duration: 26,
            isFree: false,
          },
        ],
      },
      {
        title: "APIs in Practice",
        description: "REST, validation and security.",
        lessons: [
          {
            title: "RESTful Routing",
            description: "Resource design and HTTP verbs.",
            duration: 28,
            isFree: false,
          },
          {
            title: "Auth with JWT",
            description: "Sessions, tokens and middleware.",
            duration: 30,
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    title: "SQL & PostgreSQL Mastery",
    description:
      "From your first SELECT to advanced window functions and query optimization. Become confident with relational databases.",
    price: 1899,
    discountPrice: 1099,
    level: CourseLevel.BEGINNER,
    category: "Data Science",
    seed: "learnova-sql",
    modules: [
      {
        title: "SQL Essentials",
        description: "Querying with confidence.",
        lessons: [
          {
            title: "SELECT, WHERE & Joins",
            description: "The core of every query.",
            duration: 25,
            isFree: true,
          },
          {
            title: "Aggregation & Grouping",
            description: "Summaries with GROUP BY.",
            duration: 23,
            isFree: false,
          },
        ],
      },
      {
        title: "Advanced PostgreSQL",
        description: "Performance and depth.",
        lessons: [
          {
            title: "Window Functions",
            description: "Ranking, running totals and more.",
            duration: 31,
            isFree: false,
          },
          {
            title: "Indexing & Query Plans",
            description: "Make slow queries fast.",
            duration: 27,
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    title: "Machine Learning with Python",
    description:
      "Implement real machine learning models with scikit-learn. Covers regression, classification, clustering and evaluation.",
    price: 3299,
    discountPrice: 2199,
    level: CourseLevel.ADVANCED,
    category: "Data Science",
    seed: "learnova-ml",
    modules: [
      {
        title: "ML Fundamentals",
        description: "Core concepts and workflows.",
        lessons: [
          {
            title: "The ML Pipeline",
            description: "From data to deployment.",
            duration: 22,
            isFree: true,
          },
          {
            title: "Linear & Logistic Regression",
            description: "The workhorses of ML.",
            duration: 33,
            isFree: false,
          },
        ],
      },
      {
        title: "Practical Modeling",
        description: "Scikit-learn in action.",
        lessons: [
          {
            title: "Classification with Trees",
            description: "Random forests and boosting.",
            duration: 29,
            isFree: false,
          },
          {
            title: "Model Evaluation",
            description: "Cross-validation and metrics.",
            duration: 25,
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    title: "Figma for Product Design",
    description:
      "Design polished product UI with Figma — auto-layout, components, variables and handoff workflows that teams actually use.",
    price: 1599,
    discountPrice: 899,
    level: CourseLevel.BEGINNER,
    category: "UI/UX Design",
    seed: "learnova-figma",
    modules: [
      {
        title: "Figma Foundations",
        description: "Canvas, frames and tools.",
        lessons: [
          {
            title: "Auto-Layout Basics",
            description: "Responsive frames the easy way.",
            duration: 20,
            isFree: true,
          },
          {
            title: "Components & Variants",
            description: "Reusable design systems.",
            duration: 26,
            isFree: false,
          },
        ],
      },
      {
        title: "From UI to Handoff",
        description: "Ship ready-to-develop designs.",
        lessons: [
          {
            title: "Design Tokens & Variables",
            description: "Colors, spacing and typography.",
            duration: 24,
            isFree: false,
          },
          {
            title: "Developer Handoff",
            description: "Inspect, export and document.",
            duration: 18,
            isFree: false,
          },
        ],
      },
    ],
  },
];

const DEMO_REVIEWS: Record<string, Array<[string, number, string]>> = {
  "Complete Web Development Bootcamp": [
    [
      "learner.one@learnova.test",
      5,
      "This bootcamp took me from writing my first HTML tag to building a full-stack app. The pace is perfect and every lesson has a project.",
    ],
    [
      "learner.two@learnova.test",
      5,
      "Best course I've taken. Ayesha explains everything so clearly and the projects really make the concepts stick.",
    ],
    [
      "learner.three@learnova.test",
      4,
      "Very comprehensive. I'd love even more exercises, but the content quality is outstanding.",
    ],
    [
      "learner.four@learnova.test",
      5,
      "The DOM section alone was worth it. I finally understand JavaScript after years of confusion.",
    ],
  ],
  "React & Next.js Masterclass": [
    [
      "learner.one@learnova.test",
      5,
      "Sarah is an incredible teacher. Server components finally make sense to me now.",
    ],
    [
      "learner.three@learnova.test",
      5,
      "The data fetching chapter is gold. I rebuilt my portfolio site during this course.",
    ],
    [
      "learner.five@learnova.test",
      4,
      "Excellent depth on hooks and the App Router. A few sections assume prior React knowledge.",
    ],
  ],
  "Python for Data Science": [
    [
      "learner.two@learnova.test",
      5,
      "David makes pandas feel approachable. The visualization module is my favorite.",
    ],
    [
      "learner.five@learnova.test",
      5,
      "I went from no Python to analyzing real datasets. Fantastic course.",
    ],
    [
      "learner.one@learnova.test",
      4,
      "Great fundamentals, clear code alongs. Would love a section on time series.",
    ],
  ],
  "UI/UX Design Fundamentals": [
    [
      "learner.three@learnova.test",
      5,
      "The wireframing section changed how I think about interfaces. Highly recommend.",
    ],
    [
      "learner.four@learnova.test",
      5,
      "Perfect intro to user research. The personas exercise was so useful.",
    ],
    [
      "learner.two@learnova.test",
      4,
      "Well structured and easy to follow. The prototyping demo could be longer.",
    ],
  ],
  "Node.js & Express API Development": [
    [
      "learner.four@learnova.test",
      5,
      "Built my first real API in a weekend. Authentication section is exceptionally clear.",
    ],
    [
      "learner.one@learnova.test",
      5,
      "Finally comfortable with middleware and JWT. Excellent real-world examples.",
    ],
    [
      "learner.two@learnova.test",
      4,
      "Great course. The deployment chapter felt slightly rushed.",
    ],
  ],
  "SQL & PostgreSQL Mastery": [
    [
      "learner.five@learnova.test",
      5,
      "Window functions finally clicked for me. The query plan section is a superpower.",
    ],
    [
      "learner.three@learnova.test",
      5,
      "The exercises are the best part — you really learn by doing.",
    ],
    [
      "learner.one@learnova.test",
      4,
      "Solid SQL foundation. Could use a few more advanced performance tips.",
    ],
  ],
  "Machine Learning with Python": [
    [
      "learner.two@learnova.test",
      5,
      "Rigorous yet approachable. I shipped my first model to production after this.",
    ],
    [
      "learner.five@learnova.test",
      5,
      "The model evaluation module is worth the price alone. Extremely thorough.",
    ],
    [
      "learner.four@learnova.test",
      4,
      "Challenging but rewarding. Bring your statistics basics.",
    ],
  ],
  "Figma for Product Design": [
    [
      "learner.three@learnova.test",
      5,
      "Auto-layout and variants made my design process 10x faster.",
    ],
    [
      "learner.four@learnova.test",
      5,
      "The handoff section is a must for anyone working with developers.",
    ],
    [
      "learner.one@learnova.test",
      4,
      "Short and sweet. Exactly what a working professional needs.",
    ],
  ],
};

const getOrCreateInstructor = async (instructorData: (typeof DEMO_INSTRUCTORS)[number]) => {
  const existing = await prisma.instructor.findUnique({
    where: { email: instructorData.email },
  });

  if (existing) {
    return existing;
  }

  const data = await auth.api.signUpEmail({
    body: {
      email: instructorData.email,
      password: instructorData.password,
      name: instructorData.name,
      role: UserRole.INSTRUCTOR,
      needPasswordChange: false,
      rememberMe: false,
    },
  });

  const instructor = await prisma.instructor.create({
    data: {
      userId: data.user.id,
      name: instructorData.name,
      email: instructorData.email,
      bio: instructorData.bio,
      qualification: instructorData.qualification,
      experience: instructorData.experience,
      designation: instructorData.designation,
      currentWorkingPlace: instructorData.currentWorkingPlace,
    },
  });

  console.log("Created demo instructor:", instructor.email);
  return instructor;
};

const getOrCreateStudent = async (studentData: (typeof DEMO_STUDENTS)[number]) => {
  const existing = await prisma.student.findUnique({
    where: { email: studentData.email },
  });

  if (existing) {
    return existing;
  }

  const data = await auth.api.signUpEmail({
    body: {
      email: studentData.email,
      password: studentData.password,
      name: studentData.name,
      role: UserRole.STUDENT,
      needPasswordChange: false,
      rememberMe: false,
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: data.user.id,
      name: studentData.name,
      email: studentData.email,
    },
  });

  console.log("Created demo student:", student.email);
  return student;
};

const seedDemoCourses = async () => {
  for (const category of DEMO_CATEGORIES) {
    await prisma.category.upsert({
      where: { title: category.title },
      update: { isDeleted: false },
      create: category,
    });
  }

  const instructors = new Map<string, { id: string }>();
  for (const instructorData of DEMO_INSTRUCTORS) {
    const instructor = await getOrCreateInstructor(instructorData);
    instructors.set(instructor.email, instructor);
  }

  const students = new Map<string, { id: string }>();
  for (const studentData of DEMO_STUDENTS) {
    const student = await getOrCreateStudent(studentData);
    students.set(student.email, student);
  }

  const created = [];

  for (const courseData of DEMO_COURSES) {
    const existingCourse = await prisma.course.findFirst({
      where: { title: courseData.title },
    });

    const category = await prisma.category.findUniqueOrThrow({
      where: { title: courseData.category },
    });

    const instructorEmail =
      COURSE_INSTRUCTOR[courseData.title] ?? DEMO_INSTRUCTORS[0].email;
    const instructor = instructors.get(instructorEmail)!;

    let course = existingCourse;

    if (existingCourse) {
      console.log(`Skipping existing course: ${courseData.title}`);
      if (existingCourse.instructorId !== instructor.id) {
        course = await prisma.course.update({
          where: { id: existingCourse.id },
          data: { instructorId: instructor.id },
        });
      }
    } else {
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

      course = await prisma.course.create({
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
          averageRating: 0,
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

      created.push(courseData.title);
      console.log(`Seeded course: ${courseData.title}`);
    }

    const reviewsForCourse = DEMO_REVIEWS[courseData.title] ?? [];

    if (!course) {
      throw new Error(`Failed to resolve course: ${courseData.title}`);
    }

    for (const [studentEmail, rating, comment] of reviewsForCourse) {
      const student = students.get(studentEmail);
      if (!student) continue;

      const enrollment = await prisma.enrollment.upsert({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id,
          },
        },
        update: { isDeleted: false },
        create: {
          studentId: student.id,
          courseId: course.id,
        },
      });

      await prisma.payment.upsert({
        where: { enrollmentId: enrollment.id },
        update: { status: PaymentStatus.SUCCEEDED },
        create: {
          studentId: student.id,
          enrollmentId: enrollment.id,
          amount: courseData.price,
          currency: "USD",
          status: PaymentStatus.SUCCEEDED,
        },
      });

      await prisma.review.upsert({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id,
          },
        },
        update: { rating, comment, isDeleted: false },
        create: {
          rating,
          comment,
          studentId: student.id,
          courseId: course.id,
          instructorId: course.instructorId,
        },
      });
    }

    const stats = await prisma.review.aggregate({
      where: { courseId: course.id, isDeleted: false },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const enrollmentCount = await prisma.enrollment.count({
      where: { courseId: course.id, isDeleted: false },
    });

    await prisma.course.update({
      where: { id: course.id },
      data: {
        averageRating: stats._avg.rating ?? 0,
        totalStudents: enrollmentCount,
      },
    });
  }

  for (const instructor of instructors.values()) {
    const avg = await prisma.review.aggregate({
      where: { instructorId: instructor.id, isDeleted: false },
      _avg: { rating: true },
    });

    await prisma.instructor.update({
      where: { id: instructor.id },
      data: { averageRating: avg._avg.rating ?? 0 },
    });
  }

  if (created.length === 0) {
    console.log("No new courses to seed. All demo courses already exist.");
  } else {
    console.log(`Done. Seeded ${created.length} new course(s).`);
  }

  const reviewCount = await prisma.review.count({ where: { isDeleted: false } });
  const studentCount = await prisma.student.count({ where: { isDeleted: false } });
  console.log(
    `Demo data ready: ${DEMO_COURSES.length} courses, ${DEMO_INSTRUCTORS.length} instructors, ${DEMO_STUDENTS.length} students, ${reviewCount} reviews.`,
  );
};

seedDemoCourses()
  .catch((error) => {
    console.error("Failed to seed demo data:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
