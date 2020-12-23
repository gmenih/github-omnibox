(window as any).chrome = {
    runtime: {
        onMessage: {
            addListener: jest.fn(),
            removeListener: jest.fn(),
        },
        openOptionsPage: jest.fn(),
    },
} as any;
import {onRuntimeMessage, openOptionsPage} from '../runtime';

describe('browser runtime', () => {
    describe('openOptionsPage', () => {
        test('transforms to promise', async () => {
            (window.chrome.runtime.openOptionsPage as jest.Mock).mockImplementationOnce((callback) => callback());
            await openOptionsPage();

            expect(window.chrome.runtime.openOptionsPage).toHaveBeenCalledTimes(1);
        });
    });

    describe('onRuntimeMessage', () => {
        test('resolves when a message is received', async () => {
            (window.chrome.runtime.onMessage.addListener as jest.Mock).mockImplementationOnce((callback) => callback('message'));

            await onRuntimeMessage();

            expect(window.chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
            expect(window.chrome.runtime.onMessage.removeListener).toHaveBeenCalledTimes(1);
            expect(window.chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));
        });
    });
});
