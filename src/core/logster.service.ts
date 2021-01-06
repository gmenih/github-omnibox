/* eslint-disable @typescript-eslint/no-explicit-any */
import {container, injectable} from 'tsyringe';

@injectable()
export class Logster {
    constructor(private source?: string) {}

    public debug(...args: any[]): void {
        console.debug(...this.logMessage(args));
    }

    public info(...args: any[]): void {
        console.log(...this.logMessage(args));
    }

    public error(...args: any[]): void {
        console.error(...this.logMessage(args));
    }

    public warn(...args: any[]): void {
        console.warn(...this.logMessage(args));
    }

    private logMessage(args: any[]): any[] {
        return [`[${this.source}]`, ...args];
    }
}

container.register(Storage, Storage);

// export function logsterRegistry(registrations?: Parameters<typeof registry>[0]): ClassDecorator {
//     return (target) => {
//         registry([
//             {
//                 token: Logster,
//                 useFactory: () => {
//                     return new Logster(target.name);
//                 },
//             },
//             ...(registrations ?? []),
//         ])(target);
//     };
// }
