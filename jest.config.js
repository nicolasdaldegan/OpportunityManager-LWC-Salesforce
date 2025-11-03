const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
    ...jestConfig,

    modulePathIgnorePatterns: ['<rootDir>/.localdevserver'],

    collectCoverage: true,
    coverageDirectory: './coverage',

    collectCoverageFrom: [
        'force-app/main/default/lwc/**/*.js',
        '!force-app/main/default/lwc/**/mock*.js',
        '!force-app/main/default/lwc/**/generated/**',
        '!force-app/main/default/lwc/**/*.test.js'
    ]
};
