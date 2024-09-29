import { Schema, model } from 'mongoose';
import { IStatDocument } from './types';

// Create Schema
const StatsSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        recoveryEmail: {
            type: String,
            required: true
        },
        recoveryPassword: {
            type: String,
            required: true
        },
        channelLink: {
            type: String,
            required: true
        },
        airtableToken: {
            type: String,
            required: true
        },
        airtableLink: {
            type: String,
            required: true
        },
        views: {
            type: String
        },
        subs: {
            type: String
        },
        videos: {
            type: String
        },
        isChannelId: {
            type: Boolean
        },
        username: {
            type: String
        } // if channel id true then this will be channelid
    },
    {
        timestamps: true
    }
);

export default model<IStatDocument>('stats', StatsSchema);
