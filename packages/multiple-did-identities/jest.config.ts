export default {
  displayName: 'multiple-did-identities',
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageDirectory: '../../coverage/libs/multiple-did-identities',
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
