/* eslint-disable @typescript-eslint/no-explicit-any */
import {injectable} from 'tsyringe';

@injectable()
export class Logster {
    constructor(private source?: string) {}

    debug(...args: any[]) {
        console.debug(...this.logMessage(args));
    }

    info(...args: any[]) {
        console.log(...this.logMessage(args));
    }

    error(...args: any[]) {
        console.error(...this.logMessage(args));
    }

    warn(...args: any[]) {
        console.warn(...this.logMessage(args));
    }

    private logMessage(args: any[]): any[] {
        return [`[${this.source}]`, ...args];
    }
}
