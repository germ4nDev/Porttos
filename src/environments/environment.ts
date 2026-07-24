// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import packageInfo from '../../package.json';

export const environment = {
    appVersion: packageInfo.version,
    production: false,
    apiUrl: 'http://localhost:3000/api',
    // apiUrl: 'https://porttosapi.dymsites.co/api',
    sctUrl: 'http://localhost:3000',
    // sctUrl: 'https://porttosapi.dymsites.co'
};

