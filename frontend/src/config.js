// src/config.js
const ENV_URL = process.env.REACT_APP_API_URL;

// Better way to detect environment
const IS_BROWSER = typeof window !== 'undefined';
const ON_VERCEL = IS_BROWSER && window.location.hostname.endsWith('vercel.app');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const PROD_DEFAULT = 'https://issaconnect-production.up.railway.app';
const DEV_DEFAULT = 'http://127.0.0.1:8080';

// Determine API URL
let API_BASE_URL;

if (ENV_URL) {
    API_BASE_URL = ENV_URL;
} else if (IS_PRODUCTION) {
    API_BASE_URL = PROD_DEFAULT;
} else if (IS_BROWSER && ON_VERCEL) {
    API_BASE_URL = PROD_DEFAULT;
} else {
    API_BASE_URL = DEV_DEFAULT;
}

// Remove trailing slash if present
API_BASE_URL = API_BASE_URL.replace(/\/$/, '');

export default API_BASE_URL;