import packageInfo from '../../package.json';

export const environment = {
    appVersion: packageInfo.version,
    production: true,
    apiUrl: 'https://api.porttos.co/api',
    sctUrl: 'https://api.porttos.co'
};
