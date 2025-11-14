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

// Helper: intenta extraer un uuid/id de distintas formas que el backend puede devolver
function extractUuid(obj: any): string | null {
    if (!obj) return null;

    const tryValues = (v: any) => {
        if (v === undefined || v === null) return null;
        const s = String(v);
        if (!s || s === 'undefined' || s === 'null') return null;
        return s;
    };

    // rutas comunes donde puede venir el id/uuid
    const candidates = [
        obj.uuid,
        obj.id,
        obj.userId,
        obj.user?.id,
        obj.user?.uuid,
        obj.data?.id,
        obj.data?.uuid,
        obj.sub, // a veces viene en el payload del token
    ];

    for (const c of candidates) {
        const val = tryValues(c);
        if (val) return val;
    }

    // Si nos pasan un token JWT en este objeto, intentar parsearlo
    const maybeToken = obj.token || obj.accessToken || obj.jwt;
    if (maybeToken && typeof maybeToken === 'string') {
        try {
            const parts = maybeToken.split('.');
            if (parts.length >= 2) {
                // atob está disponible en el navegador
                const payload = parts[1] ? JSON.parse(atob(parts[1])) : {} as any;
                const jwtCandidates = [payload.sub, payload.userId, payload.id, payload.uuid];
                for (const jc of jwtCandidates) {
                    const val = tryValues(jc);
                    if (val) return val;
                }
            }
        } catch (e) {
            // fallamos silenciosamente en el parseo
            // console.debug('extractUuid: no se pudo parsear token JWT', e);
        }
    }

    return null;
}

// Helper: enmascara tokens en un objeto para logs seguros
function maskTokenForLog(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const copy: any = {};
    for (const k of Object.keys(obj)) {
        if (k.toLowerCase().includes('token') || k.toLowerCase().includes('jwt')) {
            copy[k] = '***REDACTED***';
        } else {
            copy[k] = obj[k];
        }
    }
    return copy;
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
            this.token = loginResponse.token || loginResponse.accessToken || null;
            const uuid = extractUuid(loginResponse);
            this.uuid = uuid;
            this.email = loginResponse.email || loginResponse.user?.email || null;
            this.roles = loginResponse.role ? [loginResponse.role] : (loginResponse.user?.role ? [loginResponse.user.role] : []);
            this.isSignedIn = !!this.token;
            // Guardar el UUID en localStorage sólo si existe
            if (uuid) {
                localStorage.setItem('userUuid', uuid);
            } else {
                localStorage.removeItem('userUuid');
            }
        },
        /** Inicializa el store desde localStorage (por ejemplo, al recargar la página) */
        initialize() {
            const token = localStorage.getItem('token');
            const userUuid = localStorage.getItem('userUuid');
            console.debug('[AuthStore] initialize userUuid from localStorage:', userUuid);

            if (token) {
                try {
                    // Intentar extraer payload desde el token
                    const parts = token.split('.');
                    const payload = parts[1] ? JSON.parse(atob(parts[1])) : {} as any;

                    // Preferir el UUID guardado explícitamente, si no existe, intentar extraer del token
                    const resolvedUuid = userUuid || payload?.sub || payload?.userId || payload?.id || payload?.uuid || null;

                    this.token = token;
                    this.uuid = resolvedUuid;
                    this.email = payload.sub || null;
                    this.roles = payload.role ? [payload.role] : [];
                    this.isSignedIn = true;

                    // Si resolvimos uuid desde el payload y no estaba en localStorage, guardarlo para futuras inicializaciones
                    if (!userUuid && resolvedUuid) {
                        localStorage.setItem('userUuid', resolvedUuid);
                        console.debug('[AuthStore] initialize guardó userUuid extraído del token en localStorage');
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
                // Guardar los datos del usuario registrado
                const { id, username, email, role } = response.data;
                if (id) localStorage.setItem('userUuid', id);
                if (username) localStorage.setItem('username', username);
                if (email) localStorage.setItem('email', email);
                if (role) localStorage.setItem('role', role);
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        /** Maneja el inicio de sesión de un usuario. */
        async signIn(payload: SignInRequest, router: Router, toast: ToastObject): Promise<void> {
            try {
                const response = await new AuthenticationService().signIn(payload);

                // Normalizar respuesta: a veces los backends devuelven strings o wrappers { data: {...} }
                let respRaw: any = response && response.data !== undefined ? response.data : response;
                if (typeof respRaw === 'string') {
                    try {
                        respRaw = JSON.parse(respRaw);
                    } catch (e) {
                        // no es JSON, dejar tal cual
                    }
                }
                // Si viene envuelto: response.data.data || response.data.body || response.data.result
                const respData = respRaw.data || respRaw.body || respRaw.result || respRaw;

                // Extraer token y otros campos posibles (desde body)
                let token = respData?.token || respData?.accessToken || respData?.jwt || null;

                // Si no hay token en body, intentar obtenerlo desde headers del Axios response (producción a veces lo envía ahí)
                const respFull: any = response;
                if (!token && respFull && respFull.headers) {
                    const headers = respFull.headers;
                    const authHeader = headers['authorization'] || headers['Authorization'] || headers['x-auth-token'] || headers['X-Auth-Token'];
                    if (authHeader && typeof authHeader === 'string') {
                        token = authHeader.replace(/^Bearer\s+/i, '').trim();
                        console.debug('[AuthStore] token extraído de headers');
                    }
                }

                // Fallback: si aún no hay token, puede que el AuthenticationService ya lo haya guardado en localStorage
                if (!token) {
                    const saved = localStorage.getItem('token');
                    if (saved) {
                        token = saved;
                        console.debug('[AuthStore] token obtenido desde localStorage como fallback');
                    }
                }

                // Intentar extraer uuid desde múltiples lugares: respData directo, respData.user, wrappers, o token JWT
                let uuid = extractUuid(respData) || extractUuid(respData?.user) || extractUuid(respRaw) || null;
                if (!uuid && token) {
                    uuid = extractUuid({ token });
                }

                const email = respData?.email || respData?.user?.email || null;
                const role = respData?.role || respData?.user?.role || null;

                // Log de depuración de campos clave (sin imprimir token completo)
                try {
                    console.debug('[AuthStore] signIn response keys:', Object.keys(respRaw || {}));
                    console.debug('[AuthStore] signIn resolved uuid:', uuid);
                } catch (e) { /* ignore */ }

                // Si respData está vacío, loguear detalles para diagnóstico (con token enmascarado)
                if (!respData || Object.keys(respData).length === 0) {
                    // reconstruir masked info: incluir headers si están disponibles
                    const maskedResp: any = maskTokenForLog(respRaw);
                    if (respFull && respFull.headers) {
                        maskedResp._headers = Object.keys(respFull.headers || {});
                    }
                    console.error('[AuthStore] respData vacío — detalle (masked):', maskedResp);
                    try {
                        console.error('[AuthStore] response.status:', respFull?.status, 'response.url:', respFull?.request?.responseURL || null);
                    } catch (e) { /* ignore */ }
                }

                if (!uuid) {
                    // Fallback avanzado: intentar obtener perfil del backend incluso si no tenemos token en JS
                    try {
                        const profileResp = await new AuthenticationService().getProfile();
                        const profileData = profileResp?.data || profileResp;
                        const profileUuid = extractUuid(profileData) || extractUuid(profileData?.user) || null;
                        if (profileUuid) {
                            uuid = profileUuid;
                            // rellenar email/role si vienen en el perfil
                            if (!email) {
                                try { this.email = profileData.email || profileData.user?.email || this.email; } catch(e){}
                            }
                            if (!role) {
                                try { this.roles = profileData.role ? [profileData.role] : this.roles; } catch(e){}
                            }
                            console.debug('[AuthStore] fallback profile obtuvo uuid:', uuid);
                        } else {
                            console.debug('[AuthStore] fallback profile no devolvió uuid, profileData keys:', Object.keys(profileData || {}));
                        }
                    } catch (e) {
                        console.debug('[AuthStore] fallback getProfile falló:', e);
                    }
                }

                if (!uuid) {
                    console.error('[AuthStore] ERROR: El backend no devolvió el UUID en las rutas esperadas. Campos vistos:', Object.keys(respData || {}));
                }

                this.uuid = uuid || null;
                this.email = email;
                this.token = token;
                this.isSignedIn = !!token;
                this.roles = role ? [role] : [];

                if (token) localStorage.setItem('token', token);
                if (uuid) localStorage.setItem('userUuid', uuid);
                else localStorage.removeItem('userUuid');
                if (email) localStorage.setItem('email', email);
                else localStorage.removeItem('email');
                if (role) localStorage.setItem('role', role);
                else localStorage.removeItem('role');

                console.debug('[AuthStore] userUuid guardado en localStorage:', localStorage.getItem('userUuid'));
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

        async signInWithGoogle(router: Router, toast: ToastObject, googleToken: string): Promise<void> {
            try {
                const response = await new AuthenticationService().signInWithGoogle(googleToken);
                const respData = response.data as any || {};
                const token = respData.token || respData.accessToken || null;
                const user = respData.user || respData.data || {};

                const uuid = extractUuid(user) || extractUuid(respData) || (token ? extractUuid({ token }) : null);
                const email = user.email || respData.email || null;
                const role = user.role || respData.role || null;

                this.persistSession({
                    token,
                    uuid,
                    email,
                    role,
                });

                toast.add({
                    severity: "success",
                    summary: "Inicio de sesión con Google exitoso",
                    life: 2500,
                });
                router.push({ name: "Dashboard" });
            } catch (error) {
                console.error('[AuthStore] Error al iniciar sesión con Google:', error);
                toast.add({
                    severity: "error",
                    summary: "Error de Google",
                    life: 3000,
                });
            }
        },

        persistSession({ token, uuid, email, role }: any) {
            this.token = token || null;
            this.uuid = uuid || null;
            this.email = email || null;
            this.isSignedIn = !!token;
            this.roles = role ? [role] : [];
            if (token) localStorage.setItem('token', token);
            else localStorage.removeItem('token');
            if (uuid) localStorage.setItem('userUuid', uuid);
            else localStorage.removeItem('userUuid');
            if (email) localStorage.setItem('email', email);
            else localStorage.removeItem('email');
            if (role) localStorage.setItem('role', role);
            else localStorage.removeItem('role');
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
