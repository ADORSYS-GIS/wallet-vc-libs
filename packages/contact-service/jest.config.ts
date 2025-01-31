export default {
  displayName: 'contact-service',
  testEnvironment: 'node',
  preset: 'ts-jest',
  transform: {
    '^.+\\.[t]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/contact-service',
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
