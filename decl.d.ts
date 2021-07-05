declare module 'BotTypes' {
    export interface User {
        displayname: string;
        id: string;
        cagedweebs: number;
        killedweebs: number;
        lasthunt: number;
        lastmsg: number;
    }

    export type ClientInfo = [
        import('tmi.js').Options, {"Authorization": string; "Client-Id": string;}, string
    ];
}

interface Array<T> {
    getRandomElement: () => T;
}
