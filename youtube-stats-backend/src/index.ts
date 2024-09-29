import 'module-alias/register';
import http from 'http';
import express from 'express';
import { globals } from './config/globals';
import loaders from './loaders/index';
import { logger } from './config/logger';

const DEFAULT_PORT = 3300;
const PORT: number = ((globals as Record<string, unknown>).SERVER_PORT as number) || DEFAULT_PORT;

/**
 * Start server
 * @param {number} port Port number for server to listen to.
 */
async function startServer(port: number) {
    try {
        logger.info(`${globals.ENV as string} Mode`);
        const app = express();
        const httpServer = http.createServer(app);
        const server = await loaders(app, httpServer);
        server.startRouter();

        /**
         * Remeber backend api's have greater
         * priority than  uiso therefore, api's
         * should be registered first
         */
        server.listen(port);
    } catch (error) {
        console.log('error is ', error);
    }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startServer(PORT);
