import { createRouter, createWebHistory } from 'vue-router';
import { useAuthenticationStore } from './IAM/services/Authentication.Store.ts';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // Ruta por defecto: sign-in (sin redirect)
        {
            path: '/',
            name: 'SignIn',
            component: () => import('./IAM/pages/sign-in.component.vue'),
            meta: { hideLayout: true }
        },
        // Rutas de autenticación
        {
            path: '/sign-in',
            name: 'SignInAlt',
            component: () => import('./IAM/pages/sign-in.component.vue'),
            meta: { hideLayout: true }
        },
        {
            path: '/sign-up',
            name: 'SignUp',
            component: () => import('./IAM/pages/sign-up.component.vue'),
            meta: { hideLayout: true }
        },
        // Rutas protegidas
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('./plantcare/Dashboard/components/Dashboard.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/plants',
            name: 'Plants',
            component: () => import('./plantcare/Plants/components/Plants.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/plants/new',
            component: () => import('./plantcare/Plants/components/PlantsForm.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/plants/:id',
            name: 'PlantDetail',
            component: () => import('./plantcare/PlantDetail/component/PlantDetail.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/history',
            name: 'History',
            component: () => import('./plantcare/History/components/History.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/settings',
            name: 'Settings',
            component: () => import('./plantcare/Settings/components/Settings.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/profile',
            name: 'Profile',
            component: () => import('./plantcare/Profile/Components/Profile.vue'),
            meta: { requiresAuth: true }
        }
    ]
});

// Guardia global para proteger rutas y redirigir según autenticación
router.beforeEach((to, _from, next) => {
    console.debug('[router] navigating to', to.fullPath, 'name=', to.name);
    let isAuth: boolean = false;
    try {
        // Intentar inicializar el store desde localStorage (si aún no se inicializó)
        const authStore = useAuthenticationStore();
        try {
            // initialize actualizará token/id/email/role desde localStorage si existen
            authStore.initialize();
        } catch (e) {
            // ignore initialize errors
        }
        // Si el store indica que está autenticado, ok
        if (authStore.isSignedIn) {
            isAuth = true;
        } else {
            // Fallback: si hay token y userId en localStorage, poblar el store mínimamente
            const token = localStorage.getItem('token');
            const id = localStorage.getItem('userId');
            const email = localStorage.getItem('email');
            const role = localStorage.getItem('role');
            console.debug('[router] localStorage', { token: !!token, userId: id, email: !!email, role: !!role });
            if (token && id) {
                try {
                    authStore.token = token;
                    authStore.id = id;
                    authStore.email = email ?? null;
                    authStore.roles = role ? [role] : [];
                    authStore.isSignedIn = true;
                } catch (e) {
                    // ignore
                }
                isAuth = true;
            } else {
                isAuth = false;
            }
        }
    } catch (e) {
        // Fallback final: comprobar directamente localStorage usando la clave 'token' (la que usa el store)
        isAuth = !!localStorage.getItem('token') || !!localStorage.getItem('userId');
    }

    console.debug('[router] requiresAuth=', (to.meta as any).requiresAuth, 'isAuth=', isAuth);

    if ((to.meta as any).requiresAuth && !isAuth) {
        console.debug('[router] not authenticated but allowing route for dev (avoid redirect)');
        // NO redirigimos automáticamente en modo de desarrollo / para evitar bloquear la UI
        return next();
    }
    if (((to.name === 'SignIn' || to.name === 'SignInAlt' || to.name === 'SignUp') && isAuth)) {
        console.debug('[router] redirecting to Dashboard because already authenticated');
        return next({ name: 'Dashboard' });
    }
    return next();
});

export default router;
