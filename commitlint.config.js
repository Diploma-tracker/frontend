export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 500],
    "type-enum": [
      2,
      "always",
      ["fix", "hotfix", "feat", "chore", "docs", "test", "refactor"],
    ],
  },
};
