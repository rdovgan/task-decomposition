// Set NODE_ENV to development for React development build
process.env.NODE_ENV = "development";

// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Configure React Testing Library for React 19
import { configure } from "@testing-library/react";

configure({
  asyncUtilTimeout: 5000,
});

console.log("Jest setup complete - React 19 + Testing Library configured");
