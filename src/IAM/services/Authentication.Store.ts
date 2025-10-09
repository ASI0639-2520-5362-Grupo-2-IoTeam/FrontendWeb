import { defineStore } from "pinia";
import { AuthenticationService } from "./Authentication.Service.ts";

import type { Router } from 'vue-router';
import type { SignInRequest, SignUpRequest } from './Authentication.Service.ts';


// --- Interfaces Necesarias para Tipado ---

/** Define la estructura del estado (state) de Pinia. */
export interface AuthenticationState {
    uuid: string | null;
    email: string | null;
    token: string | null;
    isSignedIn: boolean;
    roles: string[]; // Por ejemplo: ["ROLE_USER", "ROLE_ADMIN"]
}

/** Define la estructura de los datos que Pinia espera para el objeto `toast`.
 * (Asumiendo que usas PrimeVue u otro sistema similar de notificaciones)
 */
interface ToastObject {
    add: (options: { severity: 'success' | 'error' | 'info' | 'warn', summary: string, life: number }) => void;
}

export const useAuthenticationStore = defineStore("authentication", {
    // 1. Tipado del State
    state: (): AuthenticationState => ({
        uuid: null,
        email: null,
        token: null,
        isSignedIn: false,
        roles: [],
    }),

    // 2. Tipado de los Getters
    getters: {
        isInitialized: (state: AuthenticationState): boolean => !!state.token,
    },

    // 3. Tipado de las Actions
    actions: {
        /** Inicializa el store con los datos del usuario y token después del login */
        initializeFromLoginResponse(loginResponse: any) {
            this.token = loginResponse.token || null;
            this.uuid = loginResponse.uuid || null;
            this.email = loginResponse.email || null;
            this.roles = loginResponse.role ? [loginResponse.role] : [];
            this.isSignedIn = !!loginResponse.token;
            // Guardar el UUID en localStorage
            if (loginResponse.uuid) {
                localStorage.setItem('userUuid', loginResponse.uuid);
            }
        },
        /** Inicializa el store desde localStorage (por ejemplo, al recargar la página) */
        initialize() {
            const token = localStorage.getItem('token') || '';
            const userUuid = localStorage.getItem('userUuid');
            console.debug('[AuthStore] initialize userUuid from localStorage:', userUuid);
            if (token && userUuid) {
                try {
                    const parts = token.split('.');
                    if (parts.length > 1 && parts[1]) {
                        const payload = JSON.parse(atob(parts[1]));
                        this.token = token;
                        this.uuid = userUuid; // Usar el UUID guardado
                        this.email = payload.sub || null;
                        this.roles = payload.role ? [payload.role] : [];
                        this.isSignedIn = true;
                    } else {
                        this.token = null;
                        this.uuid = null;
                        this.email = null;
                        this.roles = [];
                        this.isSignedIn = false;
                    }
                } catch (e) {
                    this.token = null;
                    this.uuid = null;
                    this.email = null;
                    this.roles = [];
                    this.isSignedIn = false;
                }
            } else {
                this.token = null;
                this.uuid = null;
                this.email = null;
                this.roles = [];
                this.isSignedIn = false;
            }
        },

        /** Maneja el registro de un nuevo usuario. */
        async signUp(payload: SignUpRequest) {
            try {
                const response = await new AuthenticationService().signUp(payload);
                // Registro exitoso - el backend devuelve { id, email, role }
                const { id, email, role } = response.data;
                const userUuid = id || '';
                localStorage.setItem('userUuid', userUuid);
                localStorage.setItem('email', email || '');
                localStorage.setItem('role', role || '');
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        /** Maneja el inicio de sesión de un usuario. */
        async signIn(payload: SignInRequest, router: Router, toast: ToastObject): Promise<void> {
            try {
                const response = await new AuthenticationService().signIn(payload);
                // Adaptado a la fake API: uuid, email, roles
                const { token, uuid, email, roles } = response.data as any;
                this.uuid = uuid || null;
                this.email = email;
                this.token = token;
                this.isSignedIn = true;
                this.roles = roles || [];
                localStorage.setItem('token', token);
                localStorage.setItem('userUuid', uuid || '');
                localStorage.setItem('email', email);
                localStorage.setItem('role', roles ? roles.join(',') : '');
                toast.add({ severity: "success", summary: "Inicio de sesión exitoso", life: 2000 });
                router.push({ name: "Dashboard" });
            } catch (error) {
                this.isSignedIn = false;
                this.token = null;
                this.uuid = null;
                this.email = null;
                this.roles = [];
                localStorage.removeItem('token');
                localStorage.removeItem('userUuid');
                localStorage.removeItem('email');
                localStorage.removeItem('role');
                throw error;
            }
        },

        /** Cierra la sesión del usuario. */
        signOut() {
            this.isSignedIn = false;
            this.token = null;
            this.uuid = null;
            this.email = null;
            this.roles = [];
            localStorage.removeItem('token');
            localStorage.removeItem('userUuid');
            localStorage.removeItem('email');
            localStorage.removeItem('role');
        },
    }
});
