/// <reference path="decl.d.ts"/>
import {User, ClientInfo} from 'BotTypes';
import MrDestructoidClient from './mrdestructoid';
import * as utils from './utils';
import readline from 'readline';

const clientInfo: ClientInfo = utils.readJson('clientinfo.json');
const client = new MrDestructoidClient(clientInfo);

var users: User[]; //descending order of points (world #1 is at index 0)
const usersPath = './users/users.json';
const hwCooldown = 20 * 60 * 1000; //milliseconds
const fwCooldown = 12 * 60 * 60 * 1000;
const globalCooldown = 5 * 1000;
const userCooldown = 15 * 1000;
const cloneProbability = 0.27;
const numberOfLeaders = 5;
var lastMsg = 0; //millisecond timestamp used for global cooldown
const commands = ['^help', '^commands', '^weebstats', '^weebrank', '^weebs', '^killweebs', '^kw', '^huntweebs', '^hw', '^feedweebs', '^fw', `^top${numberOfLeaders}`, '^leaderboards', '^leaderboard', '!nam_the_weebs_bot', '^nam_the_weebs_bot'];
const killMessages = [
    `you fed $NUMWEEBS some lingweebni 4HEad`,
    `you dropped a comedically timed piano on $NUMWEEBS!`,
    `you tried out your constitutionally granted artillery gun on $NUMWEEBS KKonaW`,
    `you nammed $NUMWEEBS out of existence.`,
    `you relentlessly slaughtered $NUMWEEBS with a lawnmower MEGALUL`,
    `($NUMWEEBS) BOP NaM`,
    `you forced $NUMWEEBS to watch endless minecraft speedruns forsenInsane`,
    `you fisted $NUMWEEBS gachiBASS`,
    `you went to the golf course with $NUMWEEBS HotPokket 🏌🏻‍`
];
const cloneMessages = [
    `you tried to poison $NUMWEEBS, but you took the wrong bottle, cloning them!`,
    `you changed your mind after seeing $NUMWEEBS multiplying themselves.`,
    `you accidentally opened a portal that summoned $NUMWEEBS!`,
    `you opened the cage to enter it, but $NUMWEEBS aimlessly wandered in.`
];

client.tmiClient.on('message', onMessageHandler);
client.tmiClient.on('connected', onConnectedHandler);
client.tmiClient.connect();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

rl.on('line', line => {
    const words = line.trim().split(' ');
    switch (words[0]) {
        case 'quit':
            process.exit(0);
            break;
        case 'log':
            utils.log(words.slice(1).join(' '));
            break;
        case 'say':
            client.say(words[1], words.slice(2).join(' '));
            break;
    }
    rl.prompt();
});

Array.prototype.getRandomElement = function () {
    return this[Math.floor(Math.random() * this.length)];
}

function sortUsers(): void {
    users.sort((a, b) => b.killedweebs - a.killedweebs);
}

function onConnectedHandler(addr: any, port: any): void {
    utils.log(`* Connected to ${addr}:${port}`);

    users = utils.readJson(usersPath);
    sortUsers();

    utils.log('* NaMbot is now running.');
    rl.prompt();
}

function getNumWeebs(num: number): string {
    return num == 1 ? `${num} weeb` : `${num} weebs`;
}

function getRandomKwMsg(num: number, clone: boolean): string {
    const messages = clone ? cloneMessages : killMessages;
    return messages.getRandomElement().replace(/\$NUMWEEBS/g, getNumWeebs(num));
}

function initUser(displayname: string, id: string): User {
    const newUser: User = {
        displayname,
        id,
        cagedweebs: 0,
        killedweebs: 0,
        lasthunt: 0,
        lastfeed: 0,
        lastmsg: new Date().getTime()
    };
    users.push(newUser);
    return newUser;
}

function getUser(id: string): User | undefined {
    return users.find(user => user.id == id);
}

async function onMessageHandler(target: string, context: any, msg: string, self: any) {
    if (self) {
        return;
    }

    const words = msg.split(' ');
    const now = new Date().getTime();
    const userId: string = context['user-id'];
    var user = getUser(userId);

    if (now - lastMsg < globalCooldown || user && now - user.lastmsg < userCooldown || !commands.includes(words[0])) {
        return;
    }
    lastMsg = now;

    if (user) {
        user.lastmsg = now;
        user.displayname = context['display-name'];
    }
    else {
        user = initUser(context['display-name'], userId);
    }

    switch (words[0]) {
        case '^huntweebs':
        case '^hw':
            const sinceLastHunt = now - user.lasthunt;

            if (sinceLastHunt < hwCooldown && (user.cagedweebs > 0 || user.killedweebs > 0)) {
                const remaining = hwCooldown - sinceLastHunt;
                client.say(target, `${user.displayname}, you already hunted some weebs recently, come back in ${utils.msToMins(remaining)} GachiPls`);
            }
            else {
                const result = Math.floor(Math.random() * 70) + 50;
                user.cagedweebs += result;
                user.lasthunt = now;
                client.say(target, `${user.displayname}, you caught ${result} weebs and you now have ${user.cagedweebs} in the cage. Type ^kw (#) to slaughter them! NaM`);
                utils.writeJson(usersPath, users);
            }
            break;

        case '^killweebs':
        case '^kw':
            const num = words[1] == 'all' ? user.cagedweebs : parseInt(words[1]);

            if (!num || num <= 0) {
                client.say(target, `${user.displayname}, invalid number of weebs hackerCD`);
            }
            else if (user.cagedweebs < num) {
                client.say(target, `${user.displayname}, you only have ${user.cagedweebs} in the cage. hackerCD`);
            }
            else {
                const clone = Math.random() < cloneProbability;
                if (!clone) {
                    user.cagedweebs -= num;
                    user.killedweebs += num;
                }
                else {
                    user.cagedweebs += num;
                }

                client.say(target, `${user.displayname}, ${getRandomKwMsg(num, clone)} There are now ${user.cagedweebs} weebs in the cage. ${clone ? 'FeelsBadMan' : 'FeelsGoodMan'}`);
                utils.writeJson(usersPath, users);
            }
            break;

        case '^feedweebs':
        case '^fw':
            const sinceLastFeed = now - user.lastfeed;
            if (user.cagedweebs < 50) {
                client.say(target, `${user.displayname}, you need at least 50 weebs to feed them! (Type ^hw to hunt weebs)`);
            }
            else if (sinceLastFeed < fwCooldown) {
                const remaining = fwCooldown - sinceLastFeed;
                client.say(target, `${user.displayname}, you already fed your weebs recently, come back in ${utils.msToHrs(remaining)}.`);
            }
            else {
                const growthFactor = 0.02 + Math.random() * 0.02;
                const newCagedWeebs = user.cagedweebs + Math.round(user.cagedweebs * growthFactor);
                client.say(target, `${user.displayname}, you fed your ${getNumWeebs(user.cagedweebs)} and they increased by ${(growthFactor * 100).toFixed(1)}% forsenScoots You now have ${getNumWeebs(newCagedWeebs)} in the cage.`);
                user.cagedweebs = newCagedWeebs;
                user.lastfeed = now;
                utils.writeJson(usersPath, users);
            }
            break;

        case '^weebstats':
        case '^weebrank':
        case '^weebs':
            sortUsers();
            const rank = users.findIndex(x => x.id == userId) + 1;
            client.say(target, `${user.displayname}, you have ${getNumWeebs(user.cagedweebs)} in the cage. You've killed ${user.killedweebs} of them, placing you at a global #${rank}! hackerCD`);
            break;

        case '^help':
        case '^commands':
            client.say(target, `Commands: ^hw/^huntweebs, ^kw/^killweebs, ^fw/^feedweebs, ^weebrank/^weebs, ^top${numberOfLeaders}/^leaderboard. global CD ${Math.ceil(globalCooldown / 1000)}s, user CD ${Math.ceil(userCooldown / 1000)}s.`)
            break;

        case '!nam_the_weebs_bot':
        case '^nam_the_weebs_bot':
            client.say(target, 'This bot is a reimplementation of spergbot02. The owner is tuulanir. github/tulanir/namtheweebsbot');
            break;

        case `^top${numberOfLeaders}`:
        case '^leaderboards':
        case '^leaderboard':
            sortUsers();
            const message = users.slice(0, numberOfLeaders)
                .reduce((a, v, i) => a + ` #${i + 1}: ${v.displayname}, ${v.killedweebs} kills.`,
                    `champions' leaderboard forsenCD`);;
            client.say(target, message);
            break;
    }
}
