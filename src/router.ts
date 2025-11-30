import { createRouter, createWebHistory } from 'vue-router';
import { useAuthenticationStore } from './iam/services/Authentication.Store.ts';
import analyticsRoutes from './analytics/presentation/analytics-routes';
import plantmanagementRoutes from './plants/presentation/plantmanagement-routes';
import subscriptionRoutes from './subscription/presentation/subscription-routes.ts';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // Ruta por defecto: sign-in (sin redirect)
        {
            path: '/',
            name: 'SignIn',
            component: () => import('./iam/pages/sign-in.component.vue'),
            meta: { hideLayout: true }
        },
        // Rutas de autenticación
        {
            path: '/sign-in',
            name: 'SignInAlt',
            component: () => import('./iam/pages/sign-in.component.vue'),
            meta: { hideLayout: true }
        },
        {
            path: '/sign-up',
            name: 'SignUp',
            component: () => import('./iam/pages/sign-up.component.vue'),
            meta: { hideLayout: true }
        },
        // Rutas protegidas
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('./shared/presentation/components/Dashboard.vue'),
            meta: { requiresAuth: true }
        },
        // Rutas anidadas para PlantManagement
        {
            path: '/plants',
            component: () => import('./plants/presentation/views/PlantManagementLayout.vue'),
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    redirect: { name: 'PlantsList' }
                },
                ...plantmanagementRoutes
            ]
        },
        // Rutas anidadas para Analytics
        {
            path: '/analytics',
            name: 'Analytics',
            component: () => import('./analytics/presentation/views/Analytics.vue'),
            meta: { requiresAuth: true },
            children: analyticsRoutes
        },
        {
            path: '/settings',
            name: 'Settings',
            component: () => import('./shared/presentation/components/Settings.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/profile',
            name: 'Profile',
            component: () => import('./Profile/Components/Profile.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/community',
            name: 'Community',
            component: () => import('./community/presentation/views/Community.vue'),
        },
        {
            path: '/subscription',
            component: () => import('./subscription/presentation/views/SubscriptionLayout.vue'),
            meta: { requiresAuth: true },
            children: subscriptionRoutes,
            redirect: { name: 'ManageSubscription' }
        },

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
            // Fallback: si hay token y userUuid en localStorage, poblar el store mínimamente
            const token = localStorage.getItem('token');
            const uuid = localStorage.getItem('userUuid');
            const email = localStorage.getItem('email');
            const role = localStorage.getItem('role');
            console.debug('[router] localStorage', { token: !!token, userUuid: uuid, email: !!email, role: !!role });
            if (token && uuid) {
                try {
                    authStore.token = token;
                    authStore.uuid = uuid;
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
        isAuth = !!localStorage.getItem('token') || !!localStorage.getItem('userUuid');
    }

    console.debug('[router] requiresAuth=', (to.meta as any).requiresAuth, 'isAuth=', isAuth);

    if ((to.meta as any).requiresAuth && !isAuth) {
        console.debug('[router] not authenticated, redirecting to sign-in');
        return next({ name: 'SignIn' });
    }
    if (((to.name === 'SignIn' || to.name === 'SignInAlt' || to.name === 'SignUp') && isAuth)) {
        console.debug('[router] redirecting to Dashboard because already authenticated');
        return next({ name: 'Dashboard' });
    }
    return next();
});

export default router;
