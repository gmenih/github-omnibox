(window as any).chrome = {
    tabs: {
        create: jest.fn(),
        onRemoved: {
            addListener: jest.fn(),
            removeListener: jest.fn(),
        },
    },
} as any;
import {createTab, rejectOnTabClosed} from '../tabs';

describe('browser tabs', () => {
    describe('createTab', () => {
        test('calls create on tabs', async () => {
            (window.chrome.tabs.create as jest.Mock).mockImplementationOnce((_, callback) => callback());

            await expect(createTab('url'));

            expect(window.chrome.tabs.create).toHaveBeenCalledTimes(1);
            expect(window.chrome.tabs.create).toHaveBeenCalledWith(
                {
                    active: true,
                    selected: true,
                    url: 'url',
                },
                expect.any(Function),
            );
        });
    });

    describe('rejectOnTabClosed', () => {
        test('calls addListener', async () => {
            rejectOnTabClosed({id: 1234} as any);

            expect(window.chrome.tabs.onRemoved.addListener).toHaveBeenCalledTimes(1);
        });

        test('rejects and calls removeListener', async () => {
            (window.chrome.tabs.onRemoved.addListener as jest.Mock).mockImplementationOnce((callback) => callback(1234));

            const tab = {id: 1234};

            await expect(rejectOnTabClosed(tab as any)).rejects.toBe(tab);

            expect(window.chrome.tabs.onRemoved.removeListener).toHaveBeenCalledTimes(1);
        });
    });
});
