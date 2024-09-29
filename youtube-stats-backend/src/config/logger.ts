import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createLogger, format, transports, Logger } from 'winston';
import { logger as expressLogger, errorLogger } from 'express-winston'
import { Environment } from '@customTypes/index'
import {globals} from './globals';
import { Handler, ErrorRequestHandler } from 'express';
const logDir = 'logs';

// Create the log directory if it does not exist
if (!existsSync(logDir)) {
	mkdirSync(logDir);
}

let httpRequest : {
	requestMethod: string,
	requestUrl: string,
	protocol: string,
	remoteIp: string,
	requestSize: number,
	userAgent: string | undefined,
	referrer: string | undefined
}
let meta : {
    httpRequest: typeof httpRequest
  };


const errorLog = join(logDir, 'error.json.log');
const requestLog = join(logDir, 'request.json.log');
const combinedLog = join(logDir, 'combined.json.log');
const combinedNonJsonLog = join(logDir, 'combined.log');
const exceptionsLog = join(logDir, 'exceptions.json.log');

// const isRequest = format((info, opts) => {
// 	if (info.isRequest) {
// 		return info;
// 	}
// 	return false;
// });

const loggingOptions = {
	level: 'info',
	format: format.combine(
		format.errors({ stack: true }),
		format.colorize(),
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
	),
}

const transportOptions = [
	new transports.File({
		filename: combinedLog,
		/*
		* Uncolorize or otherwide file will have
		* noisy color codes
		*/
		format: format.combine(format.uncolorize(), format.json())
	}),
	new transports.File({
		filename: combinedNonJsonLog,
		format: format.combine(format.uncolorize())
	})
]

/*
For Express requests logs only
This defaults logs to console as colored and
to comibied file as unclored and not all the json
e,g (HTTP GET /)
*/
export const requestLoggerInstance = createLogger({
	...loggingOptions, 
	transports:[
		new transports.Console(),
		new  transports.File({
			filename: requestLog,
			format: format.combine(format.uncolorize(), format.json())
		}),
		...transportOptions
]}
);

/*
For no -requests logs
This can log each and every thing
by using debug, info, warn and error
*/
export const logger: Logger = createLogger({
	...loggingOptions,
	transports: [
		new transports.File({
			filename: errorLog,
			level: 'error',
			format: format.combine(format.uncolorize(), format.json())
		}),
		...transportOptions
	],
	exceptionHandlers: [
		new transports.File({
			filename: exceptionsLog,
			format: format.combine(format.uncolorize(), format.json())
		})
	]
});

/*
This will log each and every request
according the fomrat we have defined 
and in json.
*/
export const requestLogger: Handler = expressLogger({
	winstonInstance: requestLoggerInstance,
	statusLevels: true,

	dynamicMeta: (req, res, err) => {
		httpRequest = {} as typeof httpRequest
		meta = {} as typeof meta
        if (req) {
			meta.httpRequest = httpRequest
            httpRequest.requestMethod = req.method
            httpRequest.requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
            httpRequest.protocol = `HTTP/${req.httpVersion}`
            // httpRequest.remoteIp = req.ip // this includes both ipv6 and ipv4 addresses separated by ':'
            httpRequest.remoteIp = (req.ip || '').indexOf(':') >= 0 ? req.ip.substring(req.ip.lastIndexOf(':') + 1) : req.ip   // just ipv4
            httpRequest.requestSize = req.socket.bytesRead
            httpRequest.referrer = req.get('Referrer')
        }
		return meta;
	}
	
});

/*
This will log each and every request
according the fomrat we have defined 
and in json.
*/
export const requestErrorLogger: ErrorRequestHandler = errorLogger({
	winstonInstance: requestLoggerInstance
});

logger.add(
	new transports.Console({
		format: format.combine(
			format.colorize(),
			format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
		),
		level: globals.ENV !== Environment.Production ? 'debug': 'info'
		})
);
