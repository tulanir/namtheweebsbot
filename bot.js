const tmi = require('tmi.js');
const fs = require('fs');
const readline = require('readline');

const client = new tmi.client({
    identity: {
        username: 'nam_the_weebs_bot',
        password: '<OAUTH TOKEN>'
    },
    channels: [
        'forsen'
    ]
});

const httpsOpts = {
    hostname: 'api.twitch.tv',
    port: 443,
    method: 'GET',
    headers: {
        'Authorization': 'Bearer <BEARER AUTH TOKEN>',
        'Client-ID': '<CLIENT ID>'
    }
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.connect();

var users, leaderboard = []; //descending order of points (world #1 is at index 0)
const hwTimeLimit = 20 * 60 * 1000; //milliseconds
const globalCooldown = 5 * 1000;
const userCooldown = 15 * 1000;
const cloneProbability = 0.27;
const numberOfUsersInLeaderboard = 3;
const commands = ['^help','^commands','^weebstats','^weebrank','^weebs','^killweebs','^kw','^huntweebs','^hw',`^top${numberOfUsersInLeaderboard}`,'^leaderboards','^leaderboard','!nam_the_weebs_bot','!namtheweebsbot'];
var lastMsg = 0; //millisecond timestamp used for global cooldown

//Returns an HH:MM:SS-format timestamp of given date.
function timestamp(date) {
    const t = [date.getHours(), date.getMinutes(), date.getSeconds()].map(x => {
        if (x < 10) return `0${x}`;
        else return x;
    });
    return `${t[0]}:${t[1]}:${t[2]}`;
}

//Returns XXmYYs format
function msToMins(ms) {
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    else return `${Math.floor(secs / 60)}m${secs % 60}s`;
}

function log(msg) {
    console.log(`[${timestamp(new Date())}] ${msg}`);
}

function sayMsg(channel, msg) {
    client.say(channel, msg).then(value => {
        log(value);
    }, reason => {
        log('REJECTED: ' + reason);
    });
}

rl.on('line', line => {
    const words = line.trim().split(' ');
    switch (words[0]) {
        case 'say':
            sayMsg(words[1], words.slice(2).join(' '));
            break;
        case 'db':
            if (words[1] == 'lb') {
                for (const x of leaderboard) console.log(x);
            }
            break;
    }
    rl.prompt();
});

function writeJson(filename, obj) {
    fs.writeFile(filename, JSON.stringify(obj), err => {
        if (err) throw err;
    });
}

function onConnectedHandler(addr, port) {
    log(`* Connected to ${addr}:${port}`);

    users = JSON.parse(fs.readFileSync('users.json'));
    leaderboard = [];

    for (const id in users)
        leaderboard.push({
            id,
            score: users[id].cagedweebs + users[id].killedweebs
        });
    
    leaderboard.sort((a, b) => b.score - a.score);

    log('* NaMbot is now running.');
    rl.prompt();
}

function getRandomKwMsg(num, clone) {
    const numweebs = num == 1 ? '1 weeb' : `${num} weebs`;

    const messages = clone ? [
        `you tried to poison ${numweebs}, but you took the wrong bottle, cloning them!`,
        `you changed your mind after seeing ${numweebs} multiplying themselves.`,
        `you accidentally opened a portal that summoned ${numweebs}!`,
        `you opened the cage to enter it, but ${numweebs} aimlessly wandered in.`
    ]:[
        `you fed ${numweebs} some lingweebni 4HEad`,
        `you dropped a comedically timed piano on ${numweebs}!`,
        `you tried out your constitutionally granted artillery gun on ${numweebs} KKonaW`,
        `you nammed ${numweebs} out of existence.`,
        `you relentlessly slaughtered ${numweebs} with a lawnmower MEGALUL`,
        `(${numweebs}) BOP NaM`,
        `you forced ${numweebs} to watch endless minecraft speedruns forsenInsane`,
        `you fisted ${numweebs} gachiBASS`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
}

function initUser(id) {
    const now = new Date().getTime();
    users[id] = {
        cagedweebs: 0,
        killedweebs: 0,
        lasthunt: 0,
        lastmsg: new Date().getTime()
    };
    leaderboard.push({id, score: 0});
    return users[id];
}

function getLeaderboardIndex(id) {
    return leaderboard.findIndex(entry => entry.id == id);
}

function updateLeaderboard(id) {
    const index = getLeaderboardIndex(id);
    leaderboard[index].score = users[id].cagedweebs + users[id].killedweebs;
    leaderboard.sort((a, b) => b.score - a.score);
}

function onMessageHandler(target, context, msg, self) {
    if (self) return;

    const words = msg.split(' ');
    const now = new Date().getTime();
    const userId = context['user-id'];
    var user = users[userId];

    if (now - lastMsg < globalCooldown || user && now - user.lastmsg < userCooldown) return;
    if (commands.includes(words[0])) {
        lastMsg = now;
        if (user) user.lastmsg = now;
        else user = initUser(userId);
    }
    else return;

    switch (words[0]) {
        case '^huntweebs':
        case '^hw':
            const sinceLastHunt = now - user.lasthunt;

            if (sinceLastHunt < hwTimeLimit && (user.cagedweebs > 0 || user.killedweebs > 0)) {
                const remaining = hwTimeLimit - sinceLastHunt;
                sayMsg(target, `${context.username}, you already hunted some weebs recently, come back in ${msToMins(remaining)} GachiPls`);
            }
            else {
                const result = Math.floor(Math.random() * 70) + 50;
                user.cagedweebs += result;
                user.lasthunt = now;
                writeJson('users.json', users);
                updateLeaderboard(userId);
                sayMsg(target, `${context.username}, you caught ${result} weebs and you now have ${user.cagedweebs} in the cage. Type ^kw (#) to slaughter them! NaM`);
            }
            break;

        case '^killweebs':
        case '^kw':
            const num = words[1] == 'all' ? user.cagedweebs : parseInt(words[1]);
            
            if (num > 0) {
                if (user.cagedweebs < num)
                    sayMsg(target, `${context.username}, you only have ${user.cagedweebs} in the cage. hackerCD`);
                else {
                    const clone = Math.random() < cloneProbability;
                    if (!clone) {
                        user.cagedweebs -= num;
                        user.killedweebs += num;
                    }
                    else
                        user.cagedweebs += num;

                    writeJson('users.json', users);
                    updateLeaderboard(userId);
                    sayMsg(target, `${context.username}, ${getRandomKwMsg(num, clone)} There are now ${user.cagedweebs} weebs in the cage. ${clone ? 'FeelsBadMan' : 'FeelsGoodMan'}`);
                }
            }
            else if (!num || num <= 0)
                sayMsg(target, `${context.username}, invalid number of weebs hackerCD`);
            break;

        case '^weebstats':
        case '^weebrank':
        case '^weebs':
            const rank = getLeaderboardIndex(userId) + 1;
            sayMsg(target, `${context.username}, you have ${user.cagedweebs} ${user.cagedweebs == 1 ? 'weeb' : 'weebs'} in the cage and you've killed ${user.killedweebs} of them, placing you at a global #${rank}! hackerCD`);
            break;

        case '^help':
        case '^commands':
            sayMsg(target, `Commands: ^huntweebs, ^hw, ^killweebs, ^kw, ^weebrank, ^weebs, ^top${numberOfUsersInLeaderboard}. global CD ${Math.ceil(globalCooldown / 1000)}s, user CD ${Math.ceil(userCooldown / 1000)}s`)
            break;
        
        case '!nam_the_weebs_bot':
        case '!namtheweebsbot':
            sayMsg(target, 'This bot is a reimplementation of spergbot02. The owner is tuulanir. github/tulanir/namtheweebsbot');
            break;

        case `^top${numberOfUsersInLeaderboard}`:
        case '^leaderboards':
        case '^leaderboard':
            httpsOpts.path = '/helix/users?id=';
            for (let i = 0; i < numberOfUsersInLeaderboard; i++)
                httpsOpts.path += leaderboard[i].id + '&id=';
            httpsOpts.path = httpsOpts.path.slice(0, -4); //remove final "&id="
            const req = https.request(httpsOpts, res => {
                let jsonStr = '';
                res.on('data', chunk => {
                    jsonStr += chunk;
                });
                res.on('end', () => {
                    try {
                        var topData = JSON.parse(jsonStr);
                    }
                    catch (error) {
                        log(error);
                        sayMsg(target, `${context.username}, error parsing user data eShrug`);
                        return;
                    }
                    let top = topData.data.map(leader => ({
                        display_name: leader.display_name,
                        score: leaderboard[getLeaderboardIndex(leader.id)].score
                    }));
                    top.sort((a, b) => b.score - a.score);
                    let message = `champions' leaderboard forsenCD `;
                    for (let i = 0; i < numberOfUsersInLeaderboard; i++)
                        message += `#${i+1}: ${top[i].display_name}, ${top[i].score}p. `;
                    sayMsg(target, message.trim());
                });
            });

            req.on('error', error => {
                log(error);
                sayMsg(`${context.username}, error from twitch API eShrug`);
            });

            req.end();
            break;
    }
}
