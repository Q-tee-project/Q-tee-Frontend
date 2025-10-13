import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      "react-perf": (await import("eslint-plugin-react-perf")).default,
    },
    rules: {
      "react-perf/jsx-no-new-object-as-prop": "error",
      "react-perf/jsx-no-new-array-as-prop": "error",
      "react-perf/jsx-no-new-function-as-prop": "error",
      "react-perf/jsx-no-jsx-as-prop": "error",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;