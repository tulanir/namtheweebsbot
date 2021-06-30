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
}

interface Array<T> {
    getRandomElement: () => T;
}
