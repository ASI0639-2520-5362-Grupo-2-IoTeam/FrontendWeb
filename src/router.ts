import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Dashboard',
            component: () => import('./plantcare/Dashboard/components/Dashboard.vue')

        },
        {
            path: '/plants',
            name: 'Plants',
            component: () => import('./plantcare/Plants/components/Plants.vue')
        },
        {
            path: '/plants/:id',
            name: 'PlantDetail',
            component: () => import('./plantcare/PlantDetail/component/PlantDetail.vue')
        },
        {
            path: '/history',
            name: 'History',
            component: () => import('./plantcare/History/components/History.vue')
        },
        {
            path: '/settings',
            name: 'Settings',
            component: () => import('./plantcare/Settings/components/Settings.vue')
        },
        {
            path: '/profile',
            name: 'Profile',
            component: () => import('./plantcare/Profile/Components/Profile.vue')
        }
    ]
})

export default router