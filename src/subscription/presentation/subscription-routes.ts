// Rutas internas del bounded context Subscription
export default [
    {
        path: '/manage-subscription',
        name: 'ManageSubscription',
        component: () => import('./views/ManageSubscription.vue'),
        meta: { requiresAuth: true }
    }
];