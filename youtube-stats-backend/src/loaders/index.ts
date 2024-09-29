import ExpressLoader from './express';
// import EmailListener from './emailListener';
import express from 'express';
import { Server } from 'http';
import { logger } from '@config/logger';
import mongooseLoader from './mongoose';

export default async (app: express.Application, httpServer: Server): Promise<ExpressLoader> => {
    
    await mongooseLoader();
    logger.info('+ Connected to Database');
    const expressObj = new ExpressLoader(app, httpServer);
    logger.info('[+] Express Initialized!');

    return expressObj;
};
