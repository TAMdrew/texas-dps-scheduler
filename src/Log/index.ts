import { yellow, green, red } from 'colorette';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Chicago');

/**
 * Returns the current timestamp in 'MM/DD/YYYY h:mm:ss' format.
 */
const timeNow = () => dayjs().format('MM/DD/YYYY h:mm:ss');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const msg = (func: (message: string) => void, message: string) => func(`${yellow(`[${timeNow()}]`)} ${green(message)}`);

/**
 * Logs an error message to the console.
 * @param message - The error message to log.
 * @param err - Optional error object or unknown error.
 */
const error = (message = 'Unknown error', err?: unknown) => {
    console.error(`[${yellow(timeNow())}] ERROR: ${red(message)}`);
    if (err) console.error(err);
};

/**
 * Logs an informational message to the console.
 * @param message - The message to log.
 */
const info = (message: string) => msg(console.info, message);

/**
 * Logs a debug message to the console only if NODE_ENV is 'development'.
 * WARNING: Do not log sensitive information (PII, tokens) even in dev mode.
 * @param message - The debug message to log.
 */
const dev = (message: string) => (process.env.NODE_ENV === 'development' ? msg(console.info, `${yellow('DEBUG ->')} ${message}`) : null);

/**
 * Logs a warning message to the console.
 * @param message - The warning message to log.
 */
const warn = (message: string) => msg(console.warn, `${yellow('WARNING ->')} ${message}`);

export { error, info, warn, dev };
