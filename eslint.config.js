import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginVue from "eslint-plugin-vue";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginVue.configs["flat/recommended"],
  {
    files: ["**/*.ts", "**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
        sourceType: "module"
      }
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "vue/singleline-html-element-content-newline": "off",
      "vue/max-attributes-per-line": "off",
      "vue/html-self-closing": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/html-indent": "off",
      "vue/attributes-order": "off",
      "vue/attribute-hyphenation": "off"
    }
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**", "packages/e2e/**", "playwright.config.ts"]
  }
);
