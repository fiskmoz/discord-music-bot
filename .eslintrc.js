module.exports = {
  env: {
    node: true,
    commonjs: true,
    es6: true,
  },
  extends: "eslint:recommended",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    sourceType: "module",
    allowImportExportEverywhere: true,
    ecmaVersion: 2018,
  },
  rules: {},
};
