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
        return http.post<RegisterResponse>(`/authentication/signup`, signUpRequest);
    }

    async signIn(signInRequest: SignInRequest): Promise<AxiosResponse<LoginResponse>> {
        // POST /api/auth/login
        const response = await http.post<LoginResponse>(`/authentication/signin`, signInRequest);

        const token = response.data.token;
        const uuid = response.data.uuid;

        // Guardar el token en localStorage para el interceptor
        if (token) {
            localStorage.setItem('token', token);
        }

        // Decodificar el JWT para extraer email y role
        const payload = decodeJWT(token);
        if (payload) {
            // Add email and role to the response data object
            (response.data as any).email = payload.sub || payload.email || null;
            (response.data as any).role = payload.role || null;
        }

        // Ensure 'id' and 'uuid' are present for the AuthStore.
        // The backend sends 'uuid', so we make sure 'id' is also there for compatibility.
        if (uuid) {
            (response.data as any).id = uuid;
        }

        // Log enmascarado para diagnósticos
        try {
            const masked: any = {};
            masked.data = { ...((response.data as any) || {}) };
            if (masked.data.token) masked.data.token = '***REDACTED***';
            console.debug('[AuthService] signIn response data for AuthStore:', masked.data);
        } catch (e) { /* ignore logging errors */ }

        return response;
    }


    async signInWithGoogle(googleToken: string) {
        return axios.post(`${import.meta.env.VITE_PLANTCARE_API_URL}/auth/google/web`, { googleToken });
    }

    // Fallback: obtener perfil del usuario autenticado
    async getProfile() {
        try {
            // This should not be called if signIn is successful, but as a fallback,
            // it should point to the correct endpoint.
            return await http.get('/users/me');
        } catch (e) {
            // Propagar para que el caller lo gestione
            throw e;
        }
    }
}
