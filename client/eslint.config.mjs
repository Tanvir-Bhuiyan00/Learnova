import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The codebase uses `any` at third-party boundaries and in admin
      // table generics. Keep it visible as a warning instead of failing lint.
      "@typescript-eslint/no-explicit-any": "warn",
      // Course thumbnails are remote Cloudinary URLs; keep <img> for those.
      "@next/next/no-img-element": "warn",
      // Mount-time effects (localStorage theme, URL->state sync) are used
      // deliberately across the app. Warn rather than fail.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
