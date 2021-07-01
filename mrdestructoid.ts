/// <reference path="decl.d.ts"/>
import tmi from 'tmi.js';
import * as axios from 'axios';
import * as utils from './utils';
import {ClientInfo} from 'BotTypes';

export default class MrDestructoidClient {
    tmiClient: tmi.Client;
    twitchAxiosInstance: axios.AxiosInstance;
    pajbotAxiosInstance: axios.AxiosInstance;

    constructor([tmiClientOpts, twitchApiHeaders, pajbotDomain]: ClientInfo) {
        this.tmiClient = new tmi.client(tmiClientOpts);
        this.twitchAxiosInstance = axios.default.create({
            baseURL: 'https://api.twitch.tv',
            headers: twitchApiHeaders
        });
        this.pajbotAxiosInstance = axios.default.create({
            baseURL: pajbotDomain
        });
    }

    async checkBanphrase(message: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.pajbotAxiosInstance.post('/api/v1/banphrases/test', { message }).then(res => {
                let response = res.data;
                if (response && response.hasOwnProperty('banned') && typeof response.banned == "boolean") {
                    resolve(response.banned);
                }
                else {
                    reject("Banphrase response is malformed");
                }
            }, err => {
                reject(err);
            });
        });
    }

    async getUsersFromIds(ids: string[]): Promise<any[]> {
        return new Promise((resolve, reject) => {
            let params = new URLSearchParams();
            for (const id of ids) {
                params.append('id', id);
            }

            this.twitchAxiosInstance.get('/helix/users', { params }).then(res => {
                let response = res.data;
                if (Array.isArray(response.data) && response.data.length != 0) {
                    resolve(response.data);
                }
                else {
                    reject('Twitch API response has no data');
                }
            }, err => {
                reject(err);
            });
        });
    }

    async sayAndLog(channel: string, msg: string) {
        return this.tmiClient.say(channel, msg).then(value => {
            utils.log(value.reduce((a, v) => a + `, ${v}`, value[0]));
        })
    }

    async say(channel: string, msg: string) {
        return this.checkBanphrase(msg).then(banned => {
            if (banned) {
                this.sayAndLog(channel, 'Banphrased.');
            }
            else {
                this.sayAndLog(channel, msg);
            }
        }, err => {
            utils.log('Banphrase check error: ' + err);
        })
    }
}
