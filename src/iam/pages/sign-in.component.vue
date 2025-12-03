<script setup lang="ts">
import { ref } from 'vue';
import { useAuthenticationStore} from "../services/Authentication.Store.ts";
import { SignInRequest} from "../model/sign-in.request.ts";
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import axios from 'axios';
import logo from '../../assets/pc_logo_green.png';
import { onMounted } from 'vue';

// --- State (ref) ---
const email = ref<string>("");
const password = ref<string>("");
const submitted = ref<boolean>(false);
const errorMessage = ref<string>("");

// --- Dependencias ---
const authenticationStore = useAuthenticationStore();
const router = useRouter();
const toast = useToast();

// Definición de un tipo para la estructura de error esperada
interface ErrorResponseData {
  message: string;
}

// --- Methods (Funciones) ---
async function onSignIn(): Promise<void> {
  submitted.value = true;
  errorMessage.value = "";

  if (email.value && password.value) {
    let signInRequest = new SignInRequest(email.value, password.value);

    try {
      // Pasamos las dependencias (router y toast) al store
      await authenticationStore.signIn(signInRequest, router, toast);
    } catch (error: unknown) {
      // Log completo para diagnóstico
      console.error('[SignIn] catch error full:', error);

      // Manejo robusto de errores: AxiosError o Error genérico u otro
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponseData>;
        const status = axiosError.response?.status;
        const serverMessage = axiosError.response?.data?.message;
        const responseBody = axiosError.response?.data ? JSON.stringify(axiosError.response.data) : undefined;

        // Enmascarar headers para registro seguro
        const maskedHeaders: any = {};
        try {
          const headers = axiosError.response?.headers || {};
          Object.keys(headers).forEach((k) => {
            if (k.toLowerCase().includes('auth') || k.toLowerCase().includes('set-cookie') || k.toLowerCase().includes('token') || k.toLowerCase().includes('cookie')) {
              maskedHeaders[k] = '***REDACTED***';
            } else {
              maskedHeaders[k] = headers[k];
            }
          });
        } catch (e) { /* ignore */ }

        console.error('[SignIn] Axios error during signIn:', { status, serverMessage, maskedHeaders });

        if (status) {
          errorMessage.value = `Error ${status}: ${serverMessage || 'Comprueba las credenciales o el servidor.'}`;
        } else if (responseBody) {
          errorMessage.value = serverMessage || responseBody || 'Error al iniciar sesión. Inténtalo de nuevo.';
        } else {
          errorMessage.value = axiosError.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
        }
      } else if (error instanceof Error) {
        // Error genérico de JS
        errorMessage.value = error.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
      } else {
        // Cualquier otro tipo
        console.error('[SignIn] Unknown error type:', error);
        try {
          errorMessage.value = JSON.stringify(error) || 'Error al iniciar sesión. Inténtalo de nuevo.';
        } catch (e) {
          errorMessage.value = 'Error al iniciar sesión. Inténtalo de nuevo.';
        }
      }
    }
  } else {
    errorMessage.value = "Email y contraseña son requeridos.";
  }
}

onMounted(() => {
  window.google?.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: handleGoogleCallback,
  });

  window.google?.accounts.id.renderButton(
      document.getElementById("googleSignInDiv"),
      { theme: "outline", size: "large", text: "continue_with", shape: "pill" }
  );
});

// Handler del token recibido desde Google
async function handleGoogleCallback(response: any) {
  const googleToken = response.credential;
  if (!googleToken) return;

  try {
    await authenticationStore.signInWithGoogle(router, toast, googleToken);
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo iniciar sesión con Google",
      life: 3000,
    });
  }
}
</script>-->

<template>
  <div class="container">
    <div class="login">
      <h2 class="title">Bienvenido de vuelta!</h2>
      <img :src="logo" alt="Logo de Calfin" class="logo-image">
    </div>
    <form @submit.prevent="onSignIn">
      <div class="p-fluid">
        <div class="field mt-5">
          <div class="p-float-label">
            <InputText id="email" v-model="email" :class="{'p-invalid': submitted && !email}"/>
            <label for="email">Email</label>
          </div>
          <small v-if="submitted && !email" class="p-invalid">Email es requerido.</small>
        </div>
        <div class="field mt-5">
          <div class="p-float-label">
            <InputText id="password" v-model="password" :class="{'p-invalid': submitted && !password}" type="password"/>
            <label for="password">Contraseña</label>
          </div>
          <small v-if="submitted && !password" class="p-invalid">Contraseña es requerida</small>
        </div>
        <div class="registration-question">
          <router-link style="text-decoration: none !important;" :to="{ path: '/sign-up' }">
            <span class="text-registro">¿No tienes una cuenta aún?</span> <span class="route-to-registration">Crear cuenta</span>
          </router-link>
        </div>
      </div>
      <div class="button-container">
        <Button class="btn-register" type="submit">Iniciar sesión</Button>
      </div>

      <div class="button-container">
        <div id="googleSignInDiv" class="google-btn"></div>
      </div>
      <small v-if="errorMessage" class="p-error block mt-2">{{ errorMessage }}</small>
    </form>
    <Toast />
  </div>
</template>

<style scoped>
.view-bonds-container {
  margin-top: 2rem;
  text-align: center;
}

.separator-text {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.75rem;
  position: relative;
}

.separator-text::before,
.separator-text::after {
  content: "";
  display: inline-block;
  height: 1px;
  position: relative;
  vertical-align: middle;
  width: 30%;
  background-color: #e0e0e0;
}

.separator-text::before {
  right: 0.5em;
  margin-left: -50%;
}

.separator-text::after {
  left: 0.5em;
  margin-right: -50%;
}

.view-bonds-button {
  display: inline-block;
  background-color: #DEF5FA;
  color: #16444E;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 2em;
  text-decoration: none;
  border: 2px solid #16444E;
  transition: all 0.3s ease;
  min-width: 180px;
}

.view-bonds-button:hover {
  background-color: #16444E;
  color: #DEF5FA;
}
.container {
  max-width: 450px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.logo-image {
  max-width: 150px;
  margin: 1rem 0;
  display: block;
}
.title {
  color: #16444E;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.field {
  margin-bottom: 1.5rem;
}

.p-float-label {
  position: relative;
}

:deep(.p-inputtext) {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #16444E;
  border-radius: 1rem;
  background-color: #ffffff;
  color: #333;
  transition: all 0.3s;
}

:deep(.p-inputtext:focus) {
  border-color: #16444E;
  box-shadow: 0 0 0 2px rgba(22, 68, 78, 0.2);
}

:deep(.p-inputtext.p-invalid) {
  border-color: #ef4444;
}

:deep(label) {
  color: #16444E;
}

.p-invalid {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.registration-question {
  text-align: center;
  margin: 1.5rem 0;
}
.recaptcha-container {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
  flex-direction: column;
  align-items: center;
}
.text-registro {
  color: #666;
}

.route-to-registration {
  color: #16444E;
  font-weight: 600;
  margin-left: 0.25rem;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;

}

:deep(.btn-register) {
  background-color: #16444E;
  border: none;
  border-radius: 6rem;
  color: white;
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s;
  cursor: pointer;
  width: 58%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.btn-register:hover) {
  background-color: #1d5561;
  box-shadow: 0 4px 8px rgba(22, 68, 78, 0.3);
}

:deep(.btn-register:focus) {
  box-shadow: 0 0 0 2px rgba(22, 68, 78, 0.4);
}

:deep(.p-toast) {
  opacity: 0.95;
}
</style>