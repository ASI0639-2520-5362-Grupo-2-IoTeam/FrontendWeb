// Rutas internas del bounded context Analytics
export default [
  {
    path: '',
    name: 'AnalyticsHome',
    component: () => import('./views/Analytics.vue'),
  }
];

