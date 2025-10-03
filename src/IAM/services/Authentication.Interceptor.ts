import type { InternalAxiosRequestConfig } from 'axios';

export function authenticationInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const getToken = (): string | null => localStorage.getItem('token');

    if (config && config.url && config.url.includes('/authentication/')) {
        return config;
    }

    const token = getToken();

    // El objeto headers es opcional en InternalAxiosRequestConfig.
    // TypeScript nos exige verificar su existencia antes de modificarlo.
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}