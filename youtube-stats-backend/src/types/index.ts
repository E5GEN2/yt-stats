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
