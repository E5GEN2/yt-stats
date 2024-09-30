import { bind } from 'decko';
import { NextFunction, Request, Response } from 'express';
import { prepareSuccessResponse } from '@api/baseController';
import StatService from '@services/stats';
import Stat from '@models/components/stats/stats';
import { AnyBulkWriteOperation } from 'mongoose';
import YoutubeService from '@services/youtubeapi';
import { IStat } from '@models/components/stats/types';
import { ProxyManager } from '@services/proxyManager';
import { IBulkVideoUpload } from '@customTypes/index';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface ChannelInfo {
    email: string;
    password: string;
    recoveryEmail: string;
    recoveryPassword: string;
    channelLink: string;
    airtableToken: string;
    airtableLink: string;
    views: string;
    subs: string;
    videos: string;
    isChannelId: boolean;
    username: string;
}
interface IYTStatsResponse {
    id: string;
    statistics: {
        viewCount: string;
        subscriberCount: string;
        videoCount: string;
    };
}
export default class TestController {
    public readonly statsService: StatService = new StatService(Stat);
    public readonly youtubeService: YoutubeService = new YoutubeService();
    public readonly proxyManager: ProxyManager = ProxyManager.getInstance();

    /**
     * Get All agents
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next
     * @returns {Promise<Response | void>} Returns HTTP response
     */
    @bind
    public async uploadStats(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const stats: ChannelInfo[] = JSON.parse(req.body.stats);

            const preparedStats: ChannelInfo[] = stats.map((s) => {
                console.log('s is ', s);
                const channelInfo = this.youtubeService.getUserNameFromUrl(s.channelLink);
                return {
                    airtableLink: s.airtableLink,
                    airtableToken: s.airtableToken,
                    channelLink: s.channelLink,
                    email: s.email,
                    password: s.password,
                    recoveryEmail: s.recoveryEmail,
                    recoveryPassword: s.recoveryPassword,
                    subs: s.subs,
                    videos: s.videos,
                    views: s.views,
                    isChannelId: channelInfo.isChannelId,
                    username: channelInfo.username
                };
            });

            // Prepare bulk operations
            const bulkOperations: AnyBulkWriteOperation<any>[] = preparedStats.map((doc) => ({
                updateOne: {
                    filter: { email: doc.email }, // Unique field to check
                    update: { $setOnInsert: doc }, // Set only if inserting new
                    upsert: true // Insert if not found
                }
            }));

            const results = await this.statsService.model.bulkWrite(bulkOperations, {
                ordered: false
            });

            return prepareSuccessResponse(res, 'api working correctly', '', 'read');
        } catch (err) {
            return next(err);
        }
    }

    /**
     * Get All stats
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next
     * @returns {Promise<Response | void>} Returns HTTP response
     */
    @bind
    public async getAllStats(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            // Get pagination parameters from query
            const page: number = parseInt(req.query.page as string) || 1; // Default to page 1
            const limit: number = parseInt(req.query.limit as string) || 10; // Default to 10 records per page
            // Calculate the number of documents to skip
            const skip = (page - 1) * limit;

            // Fetch stats with pagination
            const stats = await this.statsService.model.find().skip(skip).limit(limit);

            // Get total count of documents for pagination info
            const total = await this.statsService.model.countDocuments();

            const response = { stats, total };

            return prepareSuccessResponse(res, 'api working correctly', response, 'read');
        } catch (err) {
            return next(err);
        }
    }

    /**
     * Get All stats
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next
     * @returns {Promise<Response | void>} Returns HTTP response
     */
    @bind
    public async updateSigleRecord(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const stats = await this.statsService.model.find();

            return prepareSuccessResponse(res, 'api working correctly', stats, 'read');
        } catch (err) {
            return next(err);
        }
    }

    /**
     * Get All agents
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next
     * @returns {Promise<Response | void>} Returns HTTP response
     */
    @bind
    public async updateStats(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const { statsToUpdate, apiKey } = req.body;

            console.log('stats to update', statsToUpdate);
            const updatedStatsWithChannelId = await Promise.all(
                statsToUpdate.map(async (s: IStat) => {
                    if (s.isChannelId) {
                        return s;
                    } else {
                        console.log('not a channel id ');
                        console.log('s', s);
                        const channelId = await this.youtubeService.getChannelId(
                            s.username,
                            apiKey
                        );
                        if (!channelId) {
                            const channelId = await this.youtubeService.scrapeChannelId(
                                s.channelLink
                            );

                            return {
                                ...s,
                                isChannelId: channelId ? true : false,
                                username: channelId
                            };
                            // if no channelid then parse it
                        }
                        return {
                            ...s,
                            isChannelId: channelId ? true : false,
                            username: channelId
                        };
                    }
                })
            );

            const bulkOperations = updatedStatsWithChannelId.map((stat) => ({
                updateOne: {
                    filter: { _id: stat._id }, // Assuming each stat has an _id field
                    update: { $set: stat },
                    upsert: true // Optional: use if you want to insert if not found
                }
            }));

            await this.statsService.model.bulkWrite(bulkOperations);

            // now we will do an api call to fetch channel details

            const channelIds = updatedStatsWithChannelId.map((stat) => {
                return stat.username;
            });

            console.log('channeld ids are ', channelIds);

            const stats = await this.youtubeService.getStatsCount(channelIds, apiKey);
            console.log('stats response is ', stats);

            const bulkWriteWithViewsInfo = stats.map((s: IYTStatsResponse) => {
                const statistics = s.statistics;
                return {
                    updateOne: {
                        filter: { username: s.id },
                        update: {
                            $set: {
                                views: statistics.viewCount,
                                subs: statistics.subscriberCount,
                                videos: statistics.videoCount
                            }
                        }
                    }
                };
            });

            const bulkWriteResult = await this.statsService.model.bulkWrite(bulkWriteWithViewsInfo);

            // Find the updated documents based on their IDs
            const updatedIds = updatedStatsWithChannelId.map((stat) => stat._id);
            const updatedDocuments = await this.statsService.model.find({
                _id: { $in: updatedIds }
            });

            return prepareSuccessResponse(res, 'api working correctly', updatedDocuments, 'read');
        } catch (err) {
            return next(err);
        }
    }

    /**
     * Get All stats
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next
     * @returns {Promise<Response | void>} Returns HTTP response
     */
    @bind
    public async deleteTable(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            await this.statsService.model.collection.drop();

            return prepareSuccessResponse(res, 'table deleted successfully', '', 'read');
        } catch (err) {
            return next(err);
        }
    }

    /**
     * Get All stats
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next
     * @returns {Promise<Response | void>} Returns HTTP response
     */
    @bind
    public async deleteRow(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const { id } = req.query;

            console.log('id is ', id);

            const test = await this.statsService.model.findByIdAndDelete(id);
            console.log('test is ', test);

            return prepareSuccessResponse(res, 'row deleted successfully', id, 'read');
        } catch (err) {
            return next(err);
        }
    }

    /**
     * Get All stats
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next
     * @returns {Promise<Response | void>} Returns HTTP response
     */
    @bind
    public async uploadVideo(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const { statId, videoLink, title, description } = req.body;

            const stat = await this.statsService.model.findById(statId);
            let tableName = '';
            let baseId = '';

            const regex = /https:\/\/airtable\.com\/([^/]+)\/([^/]+)/;

            // Apply the regex to the URL
            const match = stat?.airtableLink.match(regex);

            if (match && match.length >= 3) {
                baseId = match[1];
                tableName = match[2];
            } else {
                throw new Error('URL format is incorrect');
            }

            console.log(
                videoLink,
                title,
                description,
                stat?.airtableToken || '',
                baseId,
                tableName
            );

            await this.youtubeService.addRecordToAirtable(
                videoLink,
                title,
                description,
                stat?.airtableToken || '',
                baseId,
                tableName
            );

            return prepareSuccessResponse(res, 'row deleted successfully', '', 'read');
        } catch (err) {
            return next(err);
        }
    }

    /**
     * Get All stats
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next
     * @returns {Promise<Response | void>} Returns HTTP response
     */
    @bind
    public async getProxies(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const proxies = this.proxyManager.getRandomProxy();

            return prepareSuccessResponse(res, 'row deleted successfully', proxies, 'read');
        } catch (err) {
            return next(err);
        }
    }

    /**
     * Get All stats
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next
     * @returns {Promise<Response | void>} Returns HTTP response
     */
    @bind
    public async bulkUploadVideo(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const { videos }: { videos: IBulkVideoUpload[] } = req.body;

            for (const v of videos) {
                let tableName = '';
                let baseId = '';
                const regex = /https:\/\/airtable\.com\/([^/]+)\/([^/]+)/;

                // Apply the regex to the URL
                const match = v.stat?.airtableLink.match(regex);

                if (match && match.length >= 3) {
                    baseId = match[1];
                    tableName = match[2];
                }

                console.log(
                    v.videoUrl,
                    v.title,
                    v.description,
                    v.stat?.airtableToken || '',
                    baseId,
                    tableName
                );

                

                await this.youtubeService.addRecordToAirtable(
                    v.videoUrl,
                    v.title,
                    v.description,
                    v.stat.airtableToken,
                    baseId,
                    tableName
                );

                await delay(5000)
            }

            return prepareSuccessResponse(res, 'row deleted successfully', '', 'read');
        } catch (err) {
            return next(err);
        }
    }
}
