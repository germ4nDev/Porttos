import packageInfo from '../../package.json';

export const environment = {
    appVersion: packageInfo.version,
    production: true,
    apiUrl: 'https://porttosapi.dymsites.co/api',
    sctUrl: 'https://porttosapi.dymsites.co'
};
