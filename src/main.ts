import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import App from "./App.vue";
import { Button } from "primevue";
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import 'primeicons/primeicons.css'
import './style.css'
import router from './router';
import { createPinia } from 'pinia';

const app = createApp(App);

// Registrar componentes de PrimeVue globalmente
app.component('Button', Button);
app.component('InputText', InputText);
app.component('Toast', Toast);

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

// Registrar ToastService
app.use(ToastService);
app.use(ConfirmationService);

// Registrar Pinia antes de usar los stores
const pinia = createPinia();
app.use(pinia);

// Inicializar el store de autenticación al arrancar la app
import { useAuthenticationStore } from './iam/services/Authentication.Store.ts';
const authStore = useAuthenticationStore();
try {
  authStore.initialize();
} catch (e) { /* ignore */ }

app.use(router);

app.mount('#app');
