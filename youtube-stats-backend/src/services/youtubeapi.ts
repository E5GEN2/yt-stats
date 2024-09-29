import axios from 'axios';
import { ProxyManager } from './proxyManager';
import { Iproxy } from '@customTypes/index';
import { HttpsProxyAgent } from 'https-proxy-agent';
export default class YoutubeService {
    public readonly ProxyManager: ProxyManager = ProxyManager.getInstance();
    public async getChannelId(username: string, apiKey: string): Promise<string | undefined> {
        try {
            let params = {
                part: 'snippet',
                q: username,
                type: 'channel',
                key: apiKey
            };

            console.log('username is', username);
            let res = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                params: params
            });

            if (res?.data?.items?.length > 1) {
                return undefined;
            }

            let channelId = res.data.items[0]?.id?.channelId;

            return channelId;
        } catch (error) {
            console.log('error is ', error);
            return undefined;
        }
    }

    public async scrapeChannelId(url: string): Promise<string | undefined> {
        try {
            console.log('scrape channel id called');
            const randomProxy: Iproxy = this.ProxyManager.getRandomProxy();
            const response = await axios.get(url, {
                httpsAgent: new HttpsProxyAgent(
                    `http://${randomProxy.username}:${randomProxy.password}@${randomProxy.ip}:${randomProxy.port}`
                )
            });
            const text = await response.data;

            const channelIdMatch = text.match(/channel_id=([a-zA-Z0-9_-]+)/);

            return channelIdMatch[1] as string;
        } catch (error) {
            console.log('error occured', error);

            return undefined;
        }
    }

    public getUserNameFromUrl(url: string): {
        isChannelId: boolean;
        username: string;
    } {
        // Check if the URL contains "/channel/"
        if (url.includes('/channel/')) {
            // Split the URL at "/channel/" and take the part after it
            const channelId = url.split('/channel/')[1];
            const finalChannelId = channelId.split('?')[0]; // Remove any query parameters if present

            return {
                isChannelId: true,
                username: finalChannelId
            };
        }

        // If the URL contains '@', extract the username after '@'
        if (url.includes('@')) {
            const usernamePart = url.split('@')[1];
            const username = usernamePart.split('?')[0]; // Remove any query parameters if present

            return {
                isChannelId: false,
                username
            };
        }

        // Return null or a default value if the URL does not match expected patterns
        return {
            isChannelId: false,
            username: 'not found'
        };
    }

    public async getStatsCount(channelIds: string[], apiKey: string) {
        const ids = channelIds.join(',');
        const params = {
            part: 'statistics', // this will query us the stats of the channel
            id: ids,
            key: apiKey
        };

        // here make api call to fetch all the data

        try {
            let statisticsData = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
                params: params
            });

            let stats = statisticsData.data?.items;

            return stats;
        } catch (error) {
            return undefined;
        }
    }

    public async addRecordToAirtable(
        videoUrl: string,
        title: string,
        description: string,
        pat: string,
        baseId: string,
        tableName: string
    ): Promise<void> {
        const endpoint = `https://api.airtable.com/v0/${baseId}/${tableName}`;

        const headers = {
            Authorization: `Bearer ${pat}`,
            'Content-Type': 'application/json'
        };

        const data = {
            fields: {
                'Video ID': videoUrl,
                Title: title,
                Description: description
            }
        };

        try {
            console.log('going to try post');
            const response = await axios.post(endpoint, data, { headers });

            if (response.status === 200) {
                console.log('success');
            } else {
                console.log('error: ', response.status, response.data);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error:', error.response?.status, error.response?.data);
            } else {
                console.error('Unexpected error:', error);
            }
        }
    }
}
