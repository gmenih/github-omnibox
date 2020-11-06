import {container} from 'tsyringe';

export const WINDOW_TOKEN = Symbol.for('tsy-window-token');
container.register<Window>(WINDOW_TOKEN, {useValue: window});
