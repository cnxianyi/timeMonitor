const prettierPlugin = require("eslint-plugin-prettier");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const typescriptEslintParser = require("@typescript-eslint/parser");

module.exports = [
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: typescriptEslintParser,
    },
    plugins: {
      prettier: prettierPlugin,
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      "prettier/prettier": [
        "warn",
        {
          singleQuote: false,
          semi: true,
          printWidth: 100,
          trailingComma: "all",
          endOfLine: "auto",
        },
      ],
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
];
