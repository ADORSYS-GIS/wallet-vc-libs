/* eslint-disable */
export default {
  displayName: 'contact-service',
  testEnvironment: 'node',
  preset: 'ts-jest',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(\\@adorsys-gis/event-bus)/)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/contact-service',
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
