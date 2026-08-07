module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '^@registrant/(.*)$': '<rootDir>/src/registrant/$1',
    '^@organizer/(.*)$': '<rootDir>/src/organizer/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.(ts|tsx)', '**/tests/**/*.(test|spec).(ts|tsx)', '**/*.(test|spec).(ts|tsx)'],
};
