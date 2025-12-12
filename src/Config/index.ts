import { readFileSync, existsSync } from 'fs';
import YAML from 'yaml';
import { configZod, Config } from '../Interfaces/Config';
import preferredDayList from '../Assets/preferredDay';
import * as log from '../Log';
import 'dotenv/config';
import dayjs from 'dayjs';
import path from 'path';

/**
 * Parses and validates the configuration from `config.yml` or environment variables.
 * @returns The parsed configuration object.
 */
const parseConfig = (): Config => {
    const configPath = path.resolve('config.yml');
    if (!existsSync(configPath)) {
        log.error('Not found config.yml file');
        process.exit(0);
    }

    // Fix: path traversal issue ././
    const file = readFileSync(configPath, 'utf8');
    let configData = YAML.parse(file);
    configData = parsePersonalInfo(configData);
    configData.location.preferredDays = parsePreferredDays(configData.location.preferredDays);
    configData.personalInfo.phoneNumber = parsePhoneNumber(configData.personalInfo.phoneNumber);
    let startDate = dayjs(configData.location.daysAround.startDate);
    if (!configData.location.daysAround.startDate || !startDate.isValid() || startDate.isBefore(dayjs())) {
        log.dev('Invalid date in config.yml, using current date');
        startDate = dayjs();
    }
    configData.location.daysAround.startDate = startDate.format('MM/DD/YYYY');

    try {
        return configZod.parse(configData);
    } catch (e) {
        log.error('Config file is not valid');
        console.error(e);
        process.exit(1);
    }
};

export default parseConfig;

/**
 * Formats a phone number string into (###) ###-#### format.
 * @param phoneNumber - The raw phone number string (10 digits).
 * @returns The formatted phone number or null if input is invalid.
 */
function parsePhoneNumber(phoneNumber: string) {
    if (!phoneNumber) return null;
    // Phone format is ########## and we want to convert it to (###) ###-####
    return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

/**
 * Converts an array of preferred day strings (e.g., "Monday") into their corresponding integer values.
 * @param preferredDay - Array of day names.
 * @returns Array of day integers (0-6).
 */
function parsePreferredDays(preferredDay: string[]): number[] {
    const convertedPreferredDay = preferredDay.map(day => preferredDayList[day.toLowerCase()]).filter(e => e);
    return convertedPreferredDay;
}

/**
 * Loads personal information from environment variables if configured to do so.
 * @param configData - The current configuration object.
 * @returns The updated configuration object with personal info from env vars.
 */
function parsePersonalInfo(configData: Config) {
    if (!configData.personalInfo.loadFromEnv) return configData;
    log.info('Loading personal info from environment variables.');
    // Check permissions of the environment variables or just don't log them.
    // We already don't log them here.
    const { FIRSTNAME, LASTNAME, DOB, EMAIL, LASTFOURSSN, PHONENUMBER, CARDNUMBER } = process.env;
    if (!FIRSTNAME || !LASTNAME || !DOB || !EMAIL || !LASTFOURSSN) {
        log.error('Missing environment variables for personal info. Please refer to example.env file.');
        process.exit(1);
    }
    configData.personalInfo.firstName = FIRSTNAME;
    configData.personalInfo.lastName = LASTNAME;
    configData.personalInfo.dob = DOB;
    configData.personalInfo.email = EMAIL;
    configData.personalInfo.lastFourSSN = LASTFOURSSN;
    configData.personalInfo.phoneNumber = PHONENUMBER;
    configData.personalInfo.cardNumber = CARDNUMBER;
    return configData;
}
