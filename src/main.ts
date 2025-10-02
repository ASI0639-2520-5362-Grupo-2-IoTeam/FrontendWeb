import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import App from "./App.vue";
import {Button} from "primevue";
import 'primeicons/primeicons.css'
import './style.css'
import router from './router';

const app = createApp(App);
app.component('Button', Button);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(router);

app.mount('#app');
