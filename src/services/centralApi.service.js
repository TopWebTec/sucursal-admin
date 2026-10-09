
const axios = require('axios');

const centralApi = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

centralApi.interceptors.request.use((config) => {
    const baseURL = process.env.CENTRAL_API_URL;
    const apiKey = process.env.SUCURSAL_API_KEY;

    if (!baseURL || !apiKey) {
        throw new Error(
            'Falta configurar CENTRAL_API_URL o SUCURSAL_API_KEY en .env'
        );
    }

    config.baseURL = baseURL.replace(/\/+$/, '');
    config.headers['X-API-KEY'] = apiKey;

    return config;
});

module.exports = centralApi;
