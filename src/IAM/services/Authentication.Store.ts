import { defineStore } from "pinia";
import { AuthenticationService } from "./Authentication.Service.ts";

import type { Router } from 'vue-router'; // Importamos el tipo Router

// --- Interfaces Necesarias para Tipado ---

/** Define la estructura del estado (state) de Pinia. */
export interface AuthenticationState {
    id: number | null;
    username: string | null;
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


interface SignUpRequest {
    username: string;
    password: string;
    roles: string[];
}

interface SignInRequest {
    username: string;
    password: string;
}

interface AuthResponseData {
    id: number;
    username: string;
    token: string;
    roles: string[];

}



export const useAuthenticationStore = defineStore("authentication", {
    // 1. Tipado del State
    state: (): AuthenticationState => ({
        id: null,
        username: null,
        token: null,
        isSignedIn: false,
        roles: ["ROLE_USER"]
    }),

    // 2. Tipado de los Getters
    getters: {
        isInitialized: (state: AuthenticationState): boolean => !!state.token,
    },

    // 3. Tipado de las Actions
    actions: {
        /** Inicializa el estado leyendo el localStorage. */
        initialize(): void {
            const token = localStorage.getItem("token");
            const username = localStorage.getItem("username");
            // Usamos un parseo seguro, ya que localStorage solo almacena strings
            const idString = localStorage.getItem("userId");
            const id = idString ? Number(idString) : null;

            if (token && username && id !== null) {
                // Pinia maneja la reactividad sin .value
                this.token = token;
                this.id = id;
                this.username = username;
                this.isSignedIn = true;
            }
        },

        /** Maneja el registro de un nuevo usuario. */
        async signUp(signUpRequest: SignUpRequest, router: Router, toast: ToastObject): Promise<void> {
            const service = new AuthenticationService();
            const requestWithRole: SignUpRequest = {
                ...signUpRequest,
                roles: ["ROLE_USER"]
            };
            const response = await service.signUp(requestWithRole);
            if (response && response.data) {
                const data = response.data; // UserResponse
                this.id = data.id;
                this.username = data.username;
                this.roles = data.roles;

                toast.add({ severity: "success", summary: "Registro exitoso", life: 2000 });
                // Redirigir a la ruta de inicio de sesión (nombre definido en router.ts)
                router.push({ name: "SignIn" });
            }
        },

        /** Maneja el inicio de sesión de un usuario. */
        async signIn(signInRequest: SignInRequest, router: Router, toast: ToastObject): Promise<void> {
            const service = new AuthenticationService();
            const response = await service.signIn(signInRequest);

            if (response && response.data) {
                const data: AuthResponseData = response.data;

                this.id = data.id;
                this.username = data.username;
                this.token = data.token;
                this.isSignedIn = true;

                // Almacenamiento local
                localStorage.setItem("token", this.token!); // Usamos ! porque ya hemos comprobado su existencia
                localStorage.setItem("username", this.username!);
                localStorage.setItem("userId", this.id.toString()); // El ID debe ser un string para localStorage

                toast.add({ severity: "success", summary: "Inicio de sesión exitoso", life: 2000 });
                // Redirigir al Dashboard tras iniciar sesión
                router.push({ name: "Dashboard" });
            }
        },

        /** Cierra la sesión del usuario. */
        signOut(router: Router): void {
            this.id = null;
            this.username = null;
            this.token = null;
            this.isSignedIn = false;

            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");

            router.push({ name: "SignIn" });
        }
    }
});