import { NavSection } from "@/types/dashboard.types";
import { getDefaultDashboardRoute, UserRole } from "./authUtils";

export const getCommonNavItems = (role: UserRole): NavSection[] => {
  const defaultDashboard = getDefaultDashboardRoute(role);
  return [
    {
      // title : "Dashboard",
      items: [
        {
          title: "Home",
          href: "/",
          icon: "Home",
        },
        {
          title: "Dashboard",
          href: defaultDashboard,
          icon: "LayoutDashboard",
        },
        {
          title: "My Profile",
          href: `/my-profile`,
          icon: "User",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Change Password",
          href: "/change-password",
          icon: "Settings",
        },
      ],
    },
  ];
};

export const instructorNavItems: NavSection[] = [
  {
    title: "Course Management",
    items: [
      {
        title: "Courses",
        href: "/instructor/dashboard/courses",
        icon: "BookOpen",
      },
      {
        title: "Create Course",
        href: "/instructor/dashboard/courses/create",
        icon: "PlusCircle",
      },
      {
        title: "Assignments",
        href: "/instructor/dashboard/assignments",
        icon: "ClipboardList",
      },
      {
        title: "Discussions",
        href: "/instructor/dashboard/discussions",
        icon: "MessageSquare",
      },
      {
        title: "Reviews",
        href: "/instructor/dashboard/reviews",
        icon: "Star",
      },
    ],
  },
];

export const adminNavItems: NavSection[] = [
  {
    title: "User Management",
    items: [
      {
        title: "Admins",
        href: "/admin/dashboard/admins-management",
        icon: "Shield",
      },
      {
        title: "Instructors",
        href: "/admin/dashboard/instructors-management",
        icon: "GraduationCap",
      },
      {
        title: "Students",
        href: "/admin/dashboard/students-management",
        icon: "Users",
      },
      {
        title: "All Users",
        href: "/admin/dashboard/users-management",
        icon: "UserCog",
      },
    ],
  },
  {
    title: "Content Management",
    items: [
      {
        title: "Courses",
        href: "/admin/dashboard/courses-management",
        icon: "BookOpen",
      },
      {
        title: "Categories",
        href: "/admin/dashboard/categories-management",
        icon: "FolderTree",
      },
      {
        title: "Enrollments",
        href: "/admin/dashboard/enrollments-management",
        icon: "ClipboardList",
      },
      {
        title: "Discussions",
        href: "/admin/dashboard/discussions-management",
        icon: "MessageSquare",
      },
      {
        title: "Payments",
        href: "/admin/dashboard/payments-management",
        icon: "CreditCard",
      },
      {
        title: "Reviews",
        href: "/admin/dashboard/reviews-management",
        icon: "Star",
      },
    ],
  },
];

export const studentNavItems: NavSection[] = [
  {
    title: "Learning",
    items: [
      {
        title: "My Courses",
        href: "/dashboard/my-learning",
        icon: "BookOpen",
      },
      {
        title: "My Certificates",
        href: "/dashboard/my-certificates",
        icon: "Award",
      },
      {
        title: "My Reviews",
        href: "/dashboard/my-reviews",
        icon: "Star",
      },
      {
        title: "Notifications",
        href: "/notifications",
        icon: "Bell",
      },
    ],
  },
  {
    title: "Shopping",
    items: [
      {
        title: "Wishlist",
        href: "/dashboard/wishlist",
        icon: "Heart",
      },
      {
        title: "My Cart",
        href: "/dashboard/my-cart",
        icon: "ShoppingCart",
      },
      {
        title: "Payments",
        href: "/dashboard/payment-history",
        icon: "CreditCard",
      },
    ],
  },
];

export const getNavItemsByRole = (role: UserRole): NavSection[] => {
  const commonNavItems = getCommonNavItems(role);

  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return [...commonNavItems, ...adminNavItems];

    case "INSTRUCTOR":
      return [...commonNavItems, ...instructorNavItems];

    case "STUDENT":
      return [...commonNavItems, ...studentNavItems];
  }
};
