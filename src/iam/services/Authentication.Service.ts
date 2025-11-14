import http from "../../shared/services/http-common.ts";
import type { AxiosResponse } from 'axios';
import axios from "axios";
import.meta.env.VITE_PLANTCARE_API_URL

// Interfaces adaptadas a tu backend
export interface SignUpRequest {
    username: string;
    email: string;
    password: string;
    role: string; // "USER" por defecto
}

export interface SignInRequest {
    email: string;
    password: string;
}

export interface RegisterResponse {
    id: string;
    username: string;
    email: string;
    role: string;
}

// El backend devuelve token, username y uuid
export interface LoginResponse {
    token: string;
    username: string;
    uuid: string;
}

// Helper para decodificar JWT y extraer payload
function decodeJWT(token?: string | null): any | null {
    try {
        if (!token) return null;

        const parts = token.split('.');
        if (parts.length < 2 || !parts[1]) return null;

        const base64 = parts[1];
        const payload = JSON.parse(atob(base64));
        return payload;
    } catch (e) {
        console.error('Error decoding JWT:', e);
        return null;
    }
}



export class AuthenticationService {
    async signUp(signUpRequest: SignUpRequest): Promise<AxiosResponse<RegisterResponse>> {
        // POST /api/auth/register (el baseURL ya incluye /api)
        return http.post<RegisterResponse>(`/auth/register`, signUpRequest);
    }

    async signIn(signInRequest: SignInRequest): Promise<AxiosResponse<LoginResponse>> {
        // POST /api/auth/login (el baseURL ya incluye /api)
        const response = await http.post<LoginResponse>(`/auth/login`, signInRequest);

        // Detectar token tanto en body como en headers (prod puede enviar en header)
        let token = (response.data as any)?.token ?? null;
        const headers = (response && (response as any).headers) || {};
        if (!token) {
            const authHeader = headers['authorization'] || headers['Authorization'] || headers['x-auth-token'] || headers['X-Auth-Token'];
            if (authHeader && typeof authHeader === 'string') {
                // Authorization: Bearer <token>
                token = authHeader.replace(/^Bearer\s+/i, '').trim();
            }
        }

        // Si encontramos token en headers, asegurarnos de exponerlo en response.data
        if (token) {
            (response.data as any).token = token;
        }

        // Decodificar el JWT para extraer email y role
        const payload = decodeJWT(token);

        // Guardar el token en localStorage para el interceptor
        if (token) {
            localStorage.setItem('token', token);
        }

        // No sobrescribir el id con el email, solo agregar email y role si faltan
        if (payload) {
            if (!(response.data as any).email) {
                (response.data as any).email = payload.sub || payload.email || null;
            }
            if (!(response.data as any).role) {
                (response.data as any).role = payload.role || null;
            }

            // Intentar extraer un id/uuid desde el payload y exponerlo en response.data
            const possibleId = payload.sub || payload.userId || payload.id || payload.uuid || null;
            if (possibleId && !(response.data as any).id && !(response.data as any).uuid) {
                // Algunas APIs usan 'id', otras 'uuid' — poner en ambos para compatibilidad
                (response.data as any).id = possibleId;
                (response.data as any).uuid = possibleId;
            }
        }

        // Log enmascarado para diagnósticos (no imprimir token sin enmascarar)
        try {
            const masked: any = {};
            masked.data = { ...((response.data as any) || {}) };
            if (masked.data.token) masked.data.token = '***REDACTED***';
            masked.headers = Object.keys(headers || {});
            console.debug('[AuthService] signIn response masked:', masked);
        } catch (e) { /* ignore logging errors */ }

        return response as any;
    }


    async signInWithGoogle(googleToken: string) {
        return axios.post(`${import.meta.env.VITE_PLANTCARE_API_URL}/auth/google/web`, { googleToken });
    }

    // Fallback: obtener perfil del usuario autenticado
    async getProfile() {
        try {
            return await http.get('/auth/me');
        } catch (e) {
            // Propagar para que el caller lo gestione
            throw e;
        }
    }
}
