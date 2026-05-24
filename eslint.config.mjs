import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";

/** Flat ESLint (no FlatCompat) — works with `next build` lint step. */
export default [
  {
    ignores: [".next/**", "node_modules/**", "out/**"],
  },
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  {
    files: ["**/*.{js,mjs}"],
    settings: {
      react: {
        version: "19.0",
      },
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "react/prop-types": "off",
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
