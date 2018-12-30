import {StorageObservable} from '../../../common/storage';
import {generateSearchTerm} from '../searchTerm';

describe('Omnibox SearchTerm', () => {
    describe('generateSearchTerm()', () => {
        test('adds user scopes by default', () => {
            const stubStorage: StorageObservable = {
                organizations: ['org1', 'org2'],
                username: 'testUser',
            } as any;
            const term = generateSearchTerm('test', stubStorage);

            expect(term).toContain('user:testUser');
            expect(term).toContain('user:org1');
            expect(term).toContain('user:org2');
        });

        test('adds fork by default', () => {
            const stubStorage: StorageObservable = {
                organizations: ['org1', 'org2'],
                username: 'testUser',
            } as any;
            const term = generateSearchTerm('test', stubStorage);

            expect(term).toContain('fork:true');
        });

        test('removes user scopes when using global flag', () => {
            const stubStorage: StorageObservable = {
                organizations: ['org1', 'org2'],
                username: 'testUser',
            } as any;
            const term = generateSearchTerm('test -g', stubStorage);

            expect(term).not.toContain('user:');
        });

        test('removed forks when using nofork flag', () => {
            const stubStorage: StorageObservable = {
                organizations: ['org1', 'org2'],
                username: 'testUser',
            } as any;
            const term = generateSearchTerm('test -nf', stubStorage);

            expect(term).not.toContain('fork:true');
        });

        test('clears flags', () => {
            const stubStorage: StorageObservable = {
                organizations: ['org1', 'org2'],
                username: 'testUser',
            } as any;
            const term = generateSearchTerm('test -nf -g', stubStorage);

            expect(term).not.toContain('-nf');
            expect(term).not.toContain('-g');
        });
    });
});
