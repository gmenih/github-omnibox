interface ExtensionWindow extends Window {
    browser?: typeof chrome;
}

function getBrowser (): typeof chrome {
    const extWindow = window as ExtensionWindow;
    if (typeof extWindow.chrome === 'undefined' && extWindow.browser) {
        return extWindow.browser;
    } else if (typeof extWindow.chrome !== 'undefined') {
        return extWindow.chrome;
    }
    throw new Error('Running outside extension context!');
}

export const browser = getBrowser();
