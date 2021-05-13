module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },

  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.test.(jsx?|tsx?)$',

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  globalSetup: './src/__tests__/setup.ts',
  globalTeardown: './src/__tests__/teardown.ts',
}
