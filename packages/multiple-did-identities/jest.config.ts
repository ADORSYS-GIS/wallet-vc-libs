export default {
  displayName: 'multiple-did-identities',
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(\\@adorsys-gis/storage)/)', // Do not ignore @adorsys-gis/storage
  ],
  extensionsToTreatAsEsm: ['.ts'], // Treat TypeScript files as ESM
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageDirectory: '../../coverage/libs/multiple-did-identities',
};
