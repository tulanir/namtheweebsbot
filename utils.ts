import * as fs from 'fs';

export function timestamp(date: Date) {
    const t = [date.getHours(), date.getMinutes(), date.getSeconds()].map(x => {
        if (x < 10) return `0${x}`;
        else return x;
    });
    return `${t[0]}:${t[1]}:${t[2]}`;
};

export function log(msg: string) {
    console.log(`[${timestamp(new Date())}] ${msg}`);
};

export function msToMins(ms: number) {
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    else return `${Math.floor(secs / 60)}m${secs % 60}s`;
}

export function readJson(filename: string): object {
    return JSON.parse(fs.readFileSync(filename).toString());
}

export function writeJson(filename: string, obj: object) {
    fs.writeFile(filename, JSON.stringify(obj), err => {
        if (err) throw err;
    });
}
