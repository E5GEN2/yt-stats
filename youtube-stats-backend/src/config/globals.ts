import EnvVar from 'dotenv';
// import { Config } from 'imap';
// import { NodemailerAuth, NodemailerServiceAuth, Auth, GraphApiAuth, OAuth2Nodemailer, ImapOAuth2 } from '@customTypes/index'
// import { LogLevel } from '@azure/msal-node';
import { Environment } from '@customTypes/index';
EnvVar.config({ path: `.env.${process.env.NODE_ENV}` });




let globals: {
    /**
     * Server configurations
     */
    ENV: string | undefined;
    SERVER_PORT: number;
    CORS: Array<string>;
    cookieOptions: object;
    NOT_FOUND: number;

    /**
     * Database configuration
     */
    DATABASE_URL: string | undefined;
};

let serverUrls: {
    FRONTEND: string;
};

let statusCodes: {
    OK: number;
    BAD_REQUEST: number;
    CONFLICT: number;
    UNAUTHORIZED: number;
    FORBIDDEN: number;
    NOT_FOUND: number;
    SERVER_ERROR: number;
    UNPROCESSABLE_ENTITY: number;
};

globals = {
    /**
     * Server configurations
     */
    ENV: process.env.NODE_ENV,
    SERVER_PORT: Number(process.env.SERVER_PORT),
    cookieOptions: {
        httpOnly: true,
        secure:
            process.env.NODE_ENV === Environment.Production ||
            process.env.NODE_ENV === Environment.Testing
    },
    CORS: (process.env.CORS as string).split(','),
    NOT_FOUND: -1,
    DATABASE_URL: process.env.DATABASE_URL
};

serverUrls = {
    FRONTEND: process.env.FRONTEND_URL as string
};

statusCodes = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500,
    UNPROCESSABLE_ENTITY: 422
};

export { globals, statusCodes, serverUrls };
