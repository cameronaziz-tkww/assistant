import * as dev from './dev';
import * as prod from './prod';

export const env = process.env.NODE_ENV === 'production' ? prod : dev;

export const EXTENSION_URL = `https://${env.CHROME_EXTENSION_ID}.chromiumapp.org`;
export const EXTENSION_CALLBACK_URL = `https://${env.CHROME_EXTENSION_ID}.chromiumapp.org/provider_cb`;

export const SERVICE_ENDPOINT = env.SERVICE_ENDPOINT;
export const FETCH_UNIT = env.FETCH_UNIT;
export const IS_DEV = env.IS_DEV;
export const DISABLED_UNITS = env.DISABLED_UNITS;

export * from './combine';
