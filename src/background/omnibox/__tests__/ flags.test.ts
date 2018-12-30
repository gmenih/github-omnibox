import {clearFlags, parseFlags, SearchFlags} from '../flags';

describe('Omnibox Flags', () => {
    describe('parseFlags()', () => {
        test.each([
            ['-g test', {isGlobal: true}],
            ['test -g', {isGlobal: true}],
            ['--global', {isGlobal: true}],
            ['test --global', {isGlobal: true}],
            ['-nf', {excludeForks: true}],
            ['test -nf', {excludeForks: true}],
            ['-nf test', {excludeForks: true}],
            ['--nofork', {excludeForks: true}],
            ['test --nofork', {excludeForks: true}],
            ['--nofork test', {excludeForks: true}],
            ['--noflag', {excludeForks: false, isGlobal: false}],
            ['--glabal', {excludeForks: false, isGlobal: false}],
        ])('should properly parse "%s"', (value: string, expected: Partial<SearchFlags>) => {
            expect(parseFlags(value)).toMatchObject(expected);
        });
    });

    describe('clearFlags()', () => {
        test.each([
            ['-g test', 'test'],
            ['test -g', 'test'],
            ['--global', ''],
            ['test --global', 'test'],
            ['-nf', ''],
            ['test -nf', 'test'],
            ['-nf test', 'test'],
            ['--nofork', ''],
            ['test --nofork', 'test'],
            ['--nofork test', 'test'],
            ['--noflag', ''],
            ['--glabal', ''],
        ])('should clear flags from "%s" to "%s"', (value: string, expected: string) => {
            expect(clearFlags(value)).toBe(expected);
        });
    });
});
