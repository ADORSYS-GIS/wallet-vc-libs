/* eslint-disable */
export default {
  displayName: 'message-service',
  testEnvironment: 'node',
  preset: 'ts-jest',
  transform: {
    '^.+\\.[t]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/message-service',
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
