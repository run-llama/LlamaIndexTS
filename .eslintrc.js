module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ["custom"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
  rules: {
    "max-params": ["error", 4],
    "prefer-const": "error",
  },
  ignorePatterns: ["dist/"],
};
