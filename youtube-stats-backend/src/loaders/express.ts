import express from 'express';
import { Server } from 'http';
import { initRestRoutes } from '../api/routes';
import cookieParser from 'cookie-parser';
import { logger, requestLogger } from '@config/logger';
import cors from 'cors';
import { globals } from '@config/globals';
import { Request } from 'express';
import path from 'path';

// eslint-disable-next-line no-unused-vars
type originCallback = (
    err: Error | null,
    origin?: Record<string, boolean | string | RegExp | (boolean | string | RegExp)[]>
) => void;
export default class App {
    public app: express.Application;
    public httpServer: Server;

    /**
     * Constructor
     * @param {express.Application} app Express Application
     * @param {Server} httpServer Express Application
     */
    constructor(app: express.Application, httpServer: Server) {
        this.app = app;
        this.httpServer = httpServer;
        this.initializeControllers();
    }

    /**
     * Start server listener
     * @param {number} port Port binding
     * @returns {void}
     */
    public listen(port: number): void {
        this.httpServer.listen(port, () => {
            logger.info(`App listening on the port ${port}`);
        });
    }

    /**
     * Start router api's
     * @returns {void}
     */
    public startRouter(): void {
        initRestRoutes(this.app);
    }

    /**
     * Serve UI
     * @returns {void}
     */
    public serveFrontEnd(): void {
        this.app.use(express.static('cytomate-ui/build'));
        this.app.get('*', (req, res) => {
            return res.sendFile(path.resolve(process.cwd(), 'cytomate-ui', 'build', 'index.html'));
        });
    }

    /**
     * Remove following apis from cors UI
     * @param {Request} req incoming request
     * @param {originCallback} callback Port binding
     * @returns {void}
     */
    public exceptionCORS = (req: Request, callback: originCallback): void => {
        const origin = req.header('Origin');
        const corsOptions = { origin: true, credentials: true };
        if (origin && globals.CORS.indexOf(origin) === globals.NOT_FOUND) {
            /**
             * If origin exists and is not in
             * whitelisted array then block request.
             * If there is no origin header then it
             * means that REST apis are being called
             * so allow it.
             */
            corsOptions.origin = false;
        }
        return callback(null, corsOptions);
    };

    /**
     * Initializes urls
     * @param {number} port Port binding
     * @returns {void}
     */
    public initializeControllers(): void {
        this.app.use(cookieParser());
        this.app.use(cors(this.exceptionCORS));
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
        this.app.use(requestLogger);
    }
}
