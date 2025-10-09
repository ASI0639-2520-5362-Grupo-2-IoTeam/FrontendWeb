import type { AxiosResponse } from 'axios';
import { BaseApi, ENDPOINTS } from '../../shared/infrastructure/base-endpoint';

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
    private baseApi: BaseApi;

    constructor() {
        this.baseApi = new BaseApi();
    }

    async signUp(signUpRequest: SignUpRequest): Promise<AxiosResponse<RegisterResponse>> {
        // POST /auth/register
        return this.baseApi.http.post<RegisterResponse>(ENDPOINTS.AUTH_REGISTER, signUpRequest);
    }

    async signIn(signInRequest: SignInRequest): Promise<AxiosResponse<LoginResponse>> {
        // Usar la fake API para buscar el usuario por email y validar password
        const { email, password } = signInRequest;
        const response = await this.baseApi.http.get<any[]>(`${ENDPOINTS.USERS}?useremail=${encodeURIComponent(email)}`);
        const users = response.data;
        if (users.length === 0 || users[0].password !== password) {
            // Simular error de login si no existe usuario o password no coincide
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