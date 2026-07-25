import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // По умолчанию правило — предупреждение, а `npm run check` предупреждения
      // пропускает. На неполных зависимостях уже дважды ловились настоящие баги
      // (замороженный isEndingCompleted, протухший hasSave), поэтому ошибка.
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Компоненты и функции объявляются через `function`, а не `const … = () =>`.
      // Стрелки в аргументах (колбэки, useCallback) правило не трогает.
      "func-style": ["error", "declaration", { allowArrowFunctions: false }],

      // Только именованные экспорты: default позволяет импортировать компонент
      // под произвольным именем и ломает автоимпорт. Скоуп — src, потому что
      // vite.config.ts и postcss.config.js без default-экспорта не работают.
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message: "Только именованный экспорт: export function Foo() {}",
        },
      ],
    },
  },
]);
