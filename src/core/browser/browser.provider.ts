import {container, FactoryFunction} from 'tsyringe';

const browserFactory: FactoryFunction<typeof chrome> = (): typeof chrome => {
    if ('browser' in window) {
        return (window as any).browser as typeof chrome;
    }
    if ('chrome' in window) {
        return window.chrome;
    }

    throw new Error('Running outside extension context!');
};

export type Browser = typeof chrome;

export const BROWSER_TOKEN = Symbol.for('tsy-browser-token');
container.register<Browser>(BROWSER_TOKEN, {useFactory: browserFactory});
