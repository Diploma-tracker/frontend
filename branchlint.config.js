const COMMON_PREFIXES = [
  "feature",
  "feat",
  "fix",
  "hotfix",
  "release",
  "docs",
  "test",
  "chore",
  "refactor",
  "style",
  "perf",
  "update",
];
const CI_PREFIXES = ["ci", "build"];
const ALL_PREFIXES = [...COMMON_PREFIXES, ...CI_PREFIXES];

module.exports = {
  prefixes: ALL_PREFIXES, // Allowed prefixes
  banned: ["wip", "tmp"], // Banned branch names
  skip: ["dev", "master", "main"], // Branches to skip checking
  separator: "/", // Separator for branch names
  disallowed: ["master", "develop", "main", "staging"], // Disallowed branch names for pushes
};
