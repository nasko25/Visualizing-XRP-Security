module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '.*css' : '<rootDir>/test/config/CSSstub.ts'
  },
  setupFilesAfterEnv: ["<rootDir>/test/config/setup-tests.ts"]
};