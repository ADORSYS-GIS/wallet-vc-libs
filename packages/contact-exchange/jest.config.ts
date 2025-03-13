module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.ts'],
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
  transformIgnorePatterns: [
    'node_modules/(?!(did-resolver-lib|@adorsys-gis/message-exchange))/',
  ],
  moduleNameMapper: {
    '^@adorsys-gis/message-exchange$':
      '<rootDir>/../message-exchange/src/index.ts',
  },
};
