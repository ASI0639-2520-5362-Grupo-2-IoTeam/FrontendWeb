import type { InternalAxiosRequestConfig } from 'axios';

export function authenticationInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const getToken = (): string | null => localStorage.getItem('token');

    // Log para depurar la URL que recibe el interceptor
    console.debug('[auth-interceptor] processing request for URL:', config.url);

    // Excluir rutas de autenticación (cambié '/authentication/' a '/auth/')
    if (config && config.url && config.url.includes('/auth/')) {
        console.debug('[auth-interceptor] auth route detected, skipping token attachment for:', config.url);
        return config;
    }

    const token = getToken();

    // Asegurar que headers existe
    if (!config.headers) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config.headers = {};
    }

    // Añadir Authorization sólo si hay token
    if (token) {
        // Log de depuración (mostrar sólo primeros y últimos 6 caracteres para evitar exponer el token completo)
        try {
            const preview = `${token.substring(0,6)}...${token.substring(token.length-6)}`;
            console.debug('[auth-interceptor] attaching token', preview, 'to request', config.url);
        } catch (e) {
            // ignore
        }
        // El objeto headers puede requerir la propiedad 'Authorization'
        // @ts-ignore
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}