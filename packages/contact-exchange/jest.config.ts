// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  testMatch: ['**/tests/**/*.test.ts', '**/src/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/contact-exchange',

  // Specify which node_modules to transform
  transformIgnorePatterns: [
    'node_modules/(?!did-resolver-lib)/'
  ],
};
