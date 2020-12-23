(window as any).chrome = {
    omnibox: {
        listenInputCancelled: {
            addListener: jest.fn(),
            removeListener: jest.fn(),
        },
        onInputChanged: {
            addListener: jest.fn(),
            removeListener: jest.fn(),
        },
        onInputEntered: {
            addListener: jest.fn(),
            removeListener: jest.fn(),
        },
        onInputStarted: {
            addListener: jest.fn(),
            removeListener: jest.fn(),
        },
        setDefaultSuggestion: jest.fn(),
    },
} as any;
import {onInputEntered, onInputStarted} from '../handlers';

describe('Omnibox handlers', () => {
    describe('onInputStarted()', () => {
        test('returns a function', () => {
            expect(onInputStarted({} as any)).toBeInstanceOf(Function);
        });

        test('calls setDefaultSuggestion when handler is called', () => {
            const handler = onInputStarted({} as any);
            handler();

            expect(window.chrome.omnibox.setDefaultSuggestion).toHaveBeenCalledTimes(1);
        });
    });

    describe('onInputEntered()', () => {
        test('returns a function', () => {
            expect(onInputEntered({} as any)).toBeInstanceOf(Function);
        });
    });
});
