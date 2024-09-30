import { IStat } from '@models/index';

export enum Environment {
    Production = 'production',
    Development = 'development',
    Testing = 'testing'
}

export interface Iproxy {
    ip: string;
    port: string;
    username: string;
    password: string;
}

export interface IBulkVideoUpload {
    stat: IStat;
    videoUrl: string;
    title: string;
    description: string;
}
