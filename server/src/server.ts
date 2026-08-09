import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed";

const bootstrap = async () => {
  // Try to seed the super admin, but never block the API from starting if
  // the database is temporarily unreachable.
  try {
    await seedSuperAdmin();
  } catch (error) {
    console.error("Failed to seed super admin:", error);
  }

  app.listen(envVars.PORT, () => {
    console.log(`Server is running on http://localhost:${envVars.PORT}`);
  });
};

bootstrap();
