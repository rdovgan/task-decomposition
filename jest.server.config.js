module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  roots: ["<rootDir>/src/server"],
  testMatch: ["<rootDir>/src/server/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/server/**/*.{js,ts}",
    "!src/server/**/*.d.ts",
    "!src/server/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
