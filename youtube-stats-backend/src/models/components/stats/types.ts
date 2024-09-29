import { Document, Model } from 'mongoose';

export interface IStat {
    readonly email: string;
    readonly password: string;
    readonly recoveryEmail: string;
    readonly channelLink: string;
    readonly airtableToken: string;
    readonly airtableLink: string;
    readonly views: string;
    readonly subs: string;
    readonly videos: string;
    readonly isChannelId: boolean;
    readonly username: string;
}

export interface IStatDocument extends IStat, Document {}
export interface IStatModel extends Model<IStatDocument> {}
