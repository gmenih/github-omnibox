/* eslint-disable @typescript-eslint/no-explicit-any */
import {container, injectable} from 'tsyringe';

@injectable()
export class Logster {
    constructor(private source?: string) {}

    public debug(...args: any[]) {
        console.debug(...this.logMessage(args));
    }

    public info(...args: any[]) {
        console.log(...this.logMessage(args));
    }

    public error(...args: any[]) {
        console.error(...this.logMessage(args));
    }

    public warn(...args: any[]) {
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
