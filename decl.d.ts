declare module 'BotTypes' {
    export interface User {
        id: string,
        cagedweebs: number,
        killedweebs: number,
        lasthunt: number,
        lastmsg: number
    }
    
    export interface LeaderboardEntry {
        id: string,
        score: number
    }

    export type ClientInfo = [
        import('tmi.js').Options, {"Authorization": string; "Client-Id": string;}, string
    ];
}

interface Array<T> {
    getRandomElement: () => T;
}
