module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    moduleDirectories: ["node_modules"],
    transform: {
      '^.+\\.ts$': [
        'ts-jest',
        {
          tsconfig: '<rootDir>/tsconfig.spec.json',
        },
      ],
    },
    testMatch: ['**/tests/**/*.test.ts', '**/src/**/*.test.ts'],
    setupFiles: ['<rootDir>/jest.setup.ts'],
    moduleFileExtensions: ['ts', 'js', 'html'],
  transformIgnorePatterns: ['node_modules/(?!did-resolver-lib)/'],
  };
  