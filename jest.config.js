module.exports = {
    roots: ['./src'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
