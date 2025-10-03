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
    let isAuth: boolean;
    try {
        const authStore = useAuthenticationStore();
        isAuth = authStore.isSignedIn;
    } catch (e) {
        isAuth = !!localStorage.getItem('authToken');
    }

    if ((to.meta as any).requiresAuth && !isAuth) {
        return next({ name: 'SignIn' });
    }
    if (((to.name === 'SignIn' || to.name === 'SignInAlt' || to.name === 'SignUp') && isAuth)) {
        return next({ name: 'Dashboard' });
    }
    return next();
});

export default router;
