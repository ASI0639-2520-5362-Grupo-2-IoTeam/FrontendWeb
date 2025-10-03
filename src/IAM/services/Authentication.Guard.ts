import Cookies from 'js-cookie';
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';

// Extender el tipo de meta para incluir nuestras propiedades personalizadas
interface RouteMetaAuth {
    requiresAuth?: boolean;
    requiredRoles?: string[];
}

// Extender el tipo RouteLocationNormalized para usar la meta tipada
type RouteLocationWithAuth = RouteLocationNormalized & { meta: RouteMetaAuth };

export function authenticationGuard(
    to: RouteLocationWithAuth,
    from: RouteLocationWithAuth,
    next: NavigationGuardNext
): void {
    const token = Cookies.get('token');
    const isSignedIn = !!token;

    if (!to.meta.requiresAuth) {
        if (isSignedIn && (to.name === 'sign-in' || to.name === 'sign-up')) {
            return next({ name: 'dashboard' });
        }
        return next();
    }

    if (!isSignedIn) {
        return next({ name: 'sign-in' });
    }

    if (to.meta.requiredRoles) {
        const rolesStr = Cookies.get('roles');
        let userRoles: string[] = [];

        if (rolesStr) {
            try {
                // Se añade un bloque try/catch para manejar errores de JSON.parse
                userRoles = JSON.parse(rolesStr);
            } catch (e) {
                console.error("Error al parsear roles de cookie:", e);
                // En caso de error, podríamos redirigir al sign-in o a una página de error.
                userRoles = [];
            }
        }

        const hasRequiredRole = to.meta.requiredRoles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            return next({ name: 'dashboard' });
        }
    }

    return next();
}