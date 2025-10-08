import axios from "axios";
import http from "../../shared/services/http-common.ts";
import type { AxiosResponse } from 'axios';

// Interfaces adaptadas a tu backend
export interface SignUpRequest {
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
    email: string;
    role: string;
}

// El backend solo devuelve { token }
export interface LoginResponse {
    token: string;
    uuid: string;
    email: string;
    roles: string[];
}

export class AuthenticationService {
    async signUp(signUpRequest: SignUpRequest): Promise<AxiosResponse<RegisterResponse>> {
        // POST /api/auth/register (el baseURL ya incluye /api)
        return http.post<RegisterResponse>(`/auth/register`, signUpRequest);
    }

    async signIn(signInRequest: SignInRequest): Promise<AxiosResponse<LoginResponse>> {
        // Usar la fake API para buscar el usuario (NO usar http-common, usar axios directo)
        const { email, password } = signInRequest;
        const response = await axios.get<any[]>(`https://fakeapiplant.vercel.app/users?useremail=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        const users = response.data;
        if (users.length === 0) {
            // Simular error de login
            throw { response: { data: { message: 'Credenciales inválidas' } } };
        }
        const user = users[0];
        // Simular un token JWT (solo para frontend)
        const fakeToken = btoa(`${user.useremail}:${user.roles.join(',')}`);
        return {
            data: {
                token: fakeToken,
                uuid: user.id,
                email: user.useremail,
                roles: user.roles
            }
        } as AxiosResponse<LoginResponse>;
    }
}