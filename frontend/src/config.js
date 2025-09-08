// src/config.js
const ENV_URL = process.env.REACT_APP_API_URL; // optional
const ON_VERCEL = typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app');

const PROD_DEFAULT = 'https://issaconnect-production.up.railway.app'; // no trailing slash
const DEV_DEFAULT = 'http://127.0.0.1:8000';

const API_BASE_URL = ON_VERCEL
    ? PROD_DEFAULT
    : (ENV_URL || (process.env.NODE_ENV === 'production' ? PROD_DEFAULT : DEV_DEFAULT));

export default API_BASE_URL;