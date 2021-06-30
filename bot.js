"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/// <reference path="decl.d.ts"/>
var readline_1 = require("readline");
var mrdestructoid_1 = require("@sebklang/mrdestructoid");
var utils = require("@sebklang/mrdestructoid/utils");
var client = new mrdestructoid_1.MrDestructoidClient({
    identity: {
        username: 'nam_the_weebs_bot',
        password: 'oauth:bzgplybo8tb5d9v8koreperj2zgfes'
    },
    channels: [
        'tuulanir' //, 'forsen'
    ]
}, {
    'Authorization': 'Bearer 7zn7k1x1bnhmhnozssjmq0hcndk18z',
    'Client-Id': 'dvz8sa2c83y1mqze1r0gny3cnkgoio'
}, 'https://forsen.tv');
var users, leaderboard = []; //descending order of points (world #1 is at index 0)
var hwCooldown = 20 * 60 * 1000; //milliseconds
var globalCooldown = 5 * 1000;
var userCooldown = 15 * 1000;
var cloneProbability = 0.27;
var numberOfLeaders = 5;
var lastMsg = 0; //millisecond timestamp used for global cooldown
var commands = ['^help', '^commands', '^weebstats', '^weebrank', '^weebs', '^killweebs', '^kw', '^huntweebs', '^hw', "^top" + numberOfLeaders, '^leaderboards', '^leaderboard', '!nam_the_weebs_bot', '^nam_the_weebs_bot'];
var killMessages = [
    "you fed $NUMWEEBS some lingweebni 4HEad",
    "you dropped a comedically timed piano on $NUMWEEBS!",
    "you tried out your constitutionally granted artillery gun on $NUMWEEBS KKonaW",
    "you nammed $NUMWEEBS out of existence.",
    "you relentlessly slaughtered $NUMWEEBS with a lawnmower MEGALUL",
    "($NUMWEEBS) BOP NaM",
    "you forced $NUMWEEBS to watch endless minecraft speedruns forsenInsane",
    "you fisted $NUMWEEBS gachiBASS",
    "you went to the golf course with $NUMWEEBS HotPokket \uD83C\uDFCC\uD83C\uDFFB\u200D"
];
var cloneMessages = [
    "you tried to poison $NUMWEEBS, but you took the wrong bottle, cloning them!",
    "you changed your mind after seeing $NUMWEEBS multiplying themselves.",
    "you accidentally opened a portal that summoned $NUMWEEBS!",
    "you opened the cage to enter it, but $NUMWEEBS aimlessly wandered in."
];
client.tmiClient.on('message', onMessageHandler);
client.tmiClient.on('connected', onConnectedHandler);
client.tmiClient.connect();
var rl = readline_1["default"].createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});
rl.on('line', function (line) {
    var words = line.trim().split(' ');
    switch (words[0]) {
        case 'say':
            client.say(words[1], words.slice(2).join(' '));
            break;
        case 'db':
            if (words[1] == 'lb') {
                for (var _i = 0, leaderboard_1 = leaderboard; _i < leaderboard_1.length; _i++) {
                    var x = leaderboard_1[_i];
                    console.log(x);
                }
            }
            break;
    }
    rl.prompt();
});
function onConnectedHandler(addr, port) {
    utils.log("* Connected to " + addr + ":" + port);
    users = utils.readJson('users.json');
    leaderboard = [];
    for (var id in users)
        leaderboard.push({
            id: id,
            score: users[id].cagedweebs + users[id].killedweebs
        });
    leaderboard.sort(function (a, b) { return b.score - a.score; });
    utils.log('* NaMbot is now running.');
    rl.prompt();
}
function getRandomKwMsg(num, clone) {
    var numweebs = num == 1 ? '1 weeb' : num + " weebs";
    var messages = clone ? cloneMessages : killMessages;
    return messages[Math.floor(Math.random() * messages.length)].replace(/\$NUMWEEBS/g, numweebs);
}
function initUser(id) {
    var newUser = {
        id: id,
        cagedweebs: 0,
        killedweebs: 0,
        lasthunt: 0,
        lastmsg: new Date().getTime()
    };
    users.push(newUser);
    leaderboard.push({ id: id, score: 0 });
    return newUser;
}
function getUser(id) {
    return users.find(function (user) { return user.id == id; });
}
function getLeaderboardEntry(id) {
    return leaderboard.find(function (entry) { return entry.id == id; });
}
function updateLeaderboard(id) {
    var entry = getLeaderboardEntry(id);
    if (entry) {
        var user = getUser(id);
        entry.score = user.cagedweebs + user.killedweebs;
        leaderboard.sort(function (a, b) { return b.score - a.score; });
    }
}
function onMessageHandler(target, context, msg, self) {
    return __awaiter(this, void 0, void 0, function () {
        var words, now, userId, user, _a, sinceLastHunt, remaining, result, num, clone, rank, leaderIds, message, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (self) {
                        return [2 /*return*/];
                    }
                    words = msg.split(' ');
                    now = new Date().getTime();
                    userId = context['user-id'];
                    user = users[userId];
                    if (now - lastMsg < globalCooldown || user && now - user.lastmsg < userCooldown || !commands.includes(words[0])) {
                        return [2 /*return*/];
                    }
                    lastMsg = now;
                    if (user) {
                        user.lastmsg = now;
                    }
                    else {
                        user = initUser(userId);
                    }
                    _a = words[0];
                    switch (_a) {
                        case '^huntweebs': return [3 /*break*/, 1];
                        case '^hw': return [3 /*break*/, 1];
                        case '^killweebs': return [3 /*break*/, 2];
                        case '^kw': return [3 /*break*/, 2];
                        case '^weebstats': return [3 /*break*/, 3];
                        case '^weebrank': return [3 /*break*/, 3];
                        case '^weebs': return [3 /*break*/, 3];
                        case '^help': return [3 /*break*/, 4];
                        case '^commands': return [3 /*break*/, 4];
                        case '!nam_the_weebs_bot': return [3 /*break*/, 5];
                        case '^nam_the_weebs_bot': return [3 /*break*/, 5];
                        case "^top" + numberOfLeaders: return [3 /*break*/, 6];
                        case '^leaderboards': return [3 /*break*/, 6];
                        case '^leaderboard': return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 10];
                case 1:
                    sinceLastHunt = now - user.lasthunt;
                    if (sinceLastHunt < hwCooldown && (user.cagedweebs > 0 || user.killedweebs > 0)) {
                        remaining = hwCooldown - sinceLastHunt;
                        client.say(target, context.username + ", you already hunted some weebs recently, come back in " + utils.msToMins(remaining) + " GachiPls");
                    }
                    else {
                        result = Math.floor(Math.random() * 70) + 50;
                        user.cagedweebs += result;
                        user.lasthunt = now;
                        utils.writeJson('users.json', users);
                        updateLeaderboard(userId);
                        client.say(target, context.username + ", you caught " + result + " weebs and you now have " + user.cagedweebs + " in the cage. Type ^kw (#) to slaughter them! NaM");
                    }
                    return [3 /*break*/, 10];
                case 2:
                    num = words[1] == 'all' ? user.cagedweebs : parseInt(words[1]);
                    if (user.cagedweebs < num) {
                        client.say(target, context.username + ", you only have " + user.cagedweebs + " in the cage. hackerCD");
                    }
                    else if (!num || num <= 0) {
                        client.say(target, context.username + ", invalid number of weebs hackerCD");
                    }
                    else if (num > 0) {
                        clone = Math.random() < cloneProbability;
                        if (!clone) {
                            user.cagedweebs -= num;
                            user.killedweebs += num;
                        }
                        else {
                            user.cagedweebs += num;
                        }
                        utils.writeJson('users.json', users);
                        updateLeaderboard(userId);
                        client.say(target, context.username + ", " + getRandomKwMsg(num, clone) + " There are now " + user.cagedweebs + " weebs in the cage. " + (clone ? 'FeelsBadMan' : 'FeelsGoodMan'));
                    }
                    return [3 /*break*/, 10];
                case 3:
                    rank = leaderboard.findIndex(function (x) { return x.id == userId; }) + 1;
                    client.say(target, context.username + ", you have " + user.cagedweebs + " " + (user.cagedweebs == 1 ? 'weeb' : 'weebs') + " in the cage and you've killed " + user.killedweebs + " of them, placing you at a global #" + rank + "! hackerCD");
                    return [3 /*break*/, 10];
                case 4:
                    client.say(target, "Commands: ^huntweebs, ^hw, ^killweebs, ^kw, ^weebrank, ^weebs, ^top" + numberOfLeaders + ". global CD " + Math.ceil(globalCooldown / 1000) + "s, user CD " + Math.ceil(userCooldown / 1000) + "s. points = caged + killed.");
                    return [3 /*break*/, 10];
                case 5:
                    client.say(target, 'This bot is a reimplementation of spergbot02. The owner is tuulanir. github/tulanir/namtheweebsbot');
                    return [3 /*break*/, 10];
                case 6:
                    _b.trys.push([6, 8, , 9]);
                    leaderIds = leaderboard.slice(0, numberOfLeaders).map(function (x) { return x.id; });
                    return [4 /*yield*/, client.getUsersFromIds(leaderIds)];
                case 7:
                    message = (_b.sent()).map(function (leader) { return ({
                        displayName: leader.display_name,
                        score: getLeaderboardEntry(leader.id).score
                    }); }).sort(function (a, b) { return b.score - a.score; })
                        .reduce(function (a, v, i) { return a + (i + 1 + ": " + v.displayName + ", " + leaderboard[i].score + "p. "); }, "champions' leaderboard forsenCD ");
                    client.say(target, message.trim());
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _b.sent();
                    utils.log(error_1);
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
