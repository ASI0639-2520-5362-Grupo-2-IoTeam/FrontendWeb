import http from "../../shared/services/http-common.ts";
import type { AxiosResponse } from 'axios';
import axios from "axios";
import.meta.env.VITE_API_URL

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

// El backend solo devuelve { token }
export interface LoginResponse {
    token: string;
}

// Helper para decodificar JWT y extraer payload
function decodeJWT(token?: string | null): { sub: string; role: string; iat: number; exp: number } | null {
    try {
        if (!token) return null;

        const parts = token.split('.');
        if (parts.length !== 3 || !parts[1]) return null;

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

        // Decodificar el JWT para extraer email y role
        const token = response.data.token ?? null;
        const payload = decodeJWT(token);

        // Guardar el token en localStorage para el interceptor
        if (token) {
            localStorage.setItem('token', token);
        }

        // No sobrescribir el id con el email, solo agregar email y role si faltan
        if (payload) {
            if (!(response.data as any).email) {
                (response.data as any).email = payload.sub;
            }
            if (!(response.data as any).role) {
                (response.data as any).role = payload.role;
            }
        }

        return response as any;
    }


    async signInWithGoogle(googleToken: string) {
        return axios.post(`${import.meta.env.VITE_API_URL}/auth/google/login`, { googleToken });
    }
}

