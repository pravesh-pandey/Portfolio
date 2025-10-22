module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  extends: ["eslint:recommended", "plugin:node/recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  settings: {
    node: {
      version: ">=18.0.0"
    }
  },
  ignorePatterns: ["data/briefSubmissions.json", "node_modules"]
};
