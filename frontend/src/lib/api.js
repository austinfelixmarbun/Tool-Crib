import { API_BASE_URL } from '../constants/routes';

async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

export const api = {
    get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiFetch(endpoint, { method: 'POST', body }),
    patch: (endpoint, body) => apiFetch(endpoint, { method: 'PATCH', body }),
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};

export default api;
