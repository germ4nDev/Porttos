import packageInfo from '../../package.json';

export const environment = {
    appVersion: packageInfo.version,
    production: false,
    apiUrl: 'https://porttosapi.dymsites.co/api',
    sctUrl: 'http://porttosapi.dymsites.co'
};
