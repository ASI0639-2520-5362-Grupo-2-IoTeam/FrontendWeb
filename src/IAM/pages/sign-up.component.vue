<script setup lang="ts">
import { ref } from 'vue';
import { useAuthenticationStore} from "../services/Authentication.Store.ts";
import { SignUpRequest} from "../model/sign-up.request.ts";
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';

import logo from '../../assets/vue.svg';

const username = ref<string>("");
const password = ref<string>("");
const submitted = ref<boolean>(false);
const errorMessage = ref<string>("");

const authenticationStore = useAuthenticationStore();
const router = useRouter();
const toast = useToast();

interface ErrorResponseData {
  message: string;
}

async function onSignUp(): Promise<void> {
  submitted.value = true;
  errorMessage.value = "";

  if (!username.value || !password.value) {
    errorMessage.value = "Todos los campos son obligatorios.";
    return;
  }

  const signUpRequest = new SignUpRequest(username.value, password.value);

  try {
    await authenticationStore.signUp(signUpRequest, router, toast);
    // Redirigir al inicio de sesión tras registro exitoso
    router.push('/sign-in');
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponseData>;

    errorMessage.value =
        axiosError.response?.data?.message || "Error al registrarse. Inténtalo de nuevo.";
  }
}
</script>

<template>
  <div class="container">
    <div class="signup">
      <h2 class="title">¡Regístrate!</h2>
      <img :src="logo" alt="Logo de Calfin" class="logo-image">
    </div>
    <form @submit.prevent="onSignUp">
      <div class="p-fluid">
        <div class="field mt-5">
          <div class="p-float-label">
            <InputText
                id="username"
                v-model="username"
                :class="{'p-invalid': submitted && !username}"
            />
            <label for="username">Usuario</label>
          </div>
          <small v-if="submitted && !username" class="p-invalid">El nombre de usuario es obligatorio.</small>
        </div>
        <div class="field mt-5">
          <div class="p-float-label">
            <InputText
                id="password"
                v-model="password"
                type="password"
                :class="{'p-invalid': submitted && !password}"
            />
            <label for="password">Contraseña</label>
          </div>
          <small v-if="submitted && !password" class="p-invalid">La contraseña es obligatoria.</small>
        </div>
        <div class="registration-question">
          <router-link to="/sign-in" class="register-link">
            <span class="text-registro">¿Ya tienes una cuenta?</span>
            <span class="route-to-registration">Iniciar Sesión</span>
          </router-link>
        </div>
      </div>
      <div class="button-container">
        <Button class="btn-register" type="submit">Registrarse</Button>
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

.signup {
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