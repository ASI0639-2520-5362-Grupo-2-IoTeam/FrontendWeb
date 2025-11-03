import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import App from "./App.vue";
import { Button } from "primevue";
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import 'primeicons/primeicons.css'
import './style.css'
import router from './router';
import { createPinia } from 'pinia';
import './firebase.ts';

// Crear la app
const app = createApp(App);

// Registrar componentes globales
app.component('Button', Button);
app.component('InputText', InputText);
app.component('Toast', Toast);

// Configurar PrimeVue
app.use(PrimeVue, {
    theme: {
        preset: Aura,
    },
});

// Servicios globales
app.use(ToastService);

// Configurar Pinia
const pinia = createPinia();
app.use(pinia);

// Inicializar store de autenticación
import { useAuthenticationStore } from './iam/services/Authentication.Store';
const authStore = useAuthenticationStore();
try {
    authStore.initialize();
} catch (e) {
    console.warn('No se pudo inicializar el store de autenticación', e);
}

// Usar router
app.use(router);

// Montar la app
app.mount('#app');
