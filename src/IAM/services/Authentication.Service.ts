import http from "../../shared/services/http-common.ts";

import type { AxiosResponse } from 'axios';

interface SignInRequest {
    username: string;
    password: string;
}

interface SignUpRequest extends SignInRequest {
    roles: string[];
}

interface UserResponse {
    id: number;
    username: string;
    roles: string[];
    // Puedes añadir más campos que tu API devuelva aquí
    // Por ejemplo: email, token, etc.
}

interface AuthSuccessResponse {
    id: number;
    username: string;
    roles: string[];
    token: string;
}

export class AuthenticationService {
    async signIn(signInRequest: SignInRequest): Promise<AxiosResponse<AuthSuccessResponse>> {
        // Consulta GET para buscar usuario por username y password
        const response = await http.get<UserResponse[]>(`/users?username=${signInRequest.username}&password=${signInRequest.password}`);
        const users = response.data;
        if (users.length > 0) {
            // Simulamos un token y devolvemos la estructura esperada
            const user = users[0];
            return {
                ...response,
                data: {
                    id: user.id,
                    username: user.username,
                    roles: user.roles,
                    token: 'fake-jwt-token-' + user.id
                }
            };
        } else {
            // Simulamos un error de autenticación
            return Promise.reject({
                response: {
                    status: 401,
                    data: { message: 'Credenciales inválidas' }
                }
            });
        }
    }

    signUp(signUpRequest: SignUpRequest): Promise<AxiosResponse<UserResponse>> {
        return http.post<UserResponse>(`/users`, {
            username: signUpRequest.username,
            password: signUpRequest.password,
            roles: signUpRequest.roles
        });
    }

    getUserRoles(userId: number): Promise<AxiosResponse<UserResponse>> {
        return http.get<UserResponse>(`/users/${userId}`);
    }

    getUserById(userId: number): Promise<AxiosResponse<UserResponse>> {
        return http.get<UserResponse>(`/users/${userId}`);
    }
}