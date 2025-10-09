<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import Button from 'primevue/button';

import { useAuthenticationStore} from "../services/Authentication.Store.ts";
import router from "../../router.ts";
import type { Router } from 'vue-router';


type ActiveButton = 'sign-in' | 'sign-up' | null;


const authenticationStore = useAuthenticationStore();

const activeButton = ref<ActiveButton>(null);
const showMenu = ref(false);
const closingMenu = ref(false);


const isSignedIn = computed(() => {
  console.log('Estado de isSignedIn:', authenticationStore.isSignedIn);

  return authenticationStore.isSignedIn;
});

const currentUsername = computed(() => {
  console.log('Email actual:', authenticationStore.email);
  return authenticationStore.email || 'Invitado';
});


const closeMenuWithDelay = () => {
  closingMenu.value = true;
  setTimeout(() => {
    showMenu.value = false;
    closingMenu.value = false;
  }, 300);
};

const onSignIn = () => {
  activeButton.value = 'sign-in';

  (router as Router).push({ name: 'sign-in' });
  closeMenuWithDelay();
};

const onSignUp = () => {
  activeButton.value = 'sign-up';
  (router as Router).push({ name: 'sign-up' });
  closeMenuWithDelay();
};

const onSignOut = () => {
  authenticationStore.signOut();
};

const updateActiveButton = () => {

  const currentRouteName = (router as Router).currentRoute.value.name;

  if (currentRouteName === 'sign-in') {
    activeButton.value = 'sign-in';
  } else if (currentRouteName === 'sign-up') {
    activeButton.value = 'sign-up';
  } else {
    activeButton.value = null;
  }
};

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};


const rootElement = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {

  if (rootElement.value && !rootElement.value.contains(event.target as Node)) {
    closeMenuWithDelay();
  }
};


onMounted(() => {
  updateActiveButton();
  document.addEventListener('click', handleClickOutside);
});


onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});


watch(
    () => (router as Router).currentRoute.value,
    () => {
      updateActiveButton();
    }
);
</script>

<template>
  <div ref="rootElement">
    <div v-if="isSignedIn">
      <a class="welcome"> Bienvenido,
        <span>{{ currentUsername }}</span>
      </a>
      <a class="signout" @click="onSignOut">Sign Out <i class="pi pi-sign-out" style="font-size: 1rem"></i>
      </a>
    </div>
    <div v-else>
      <div class="desktop-buttons">
        <Button :class="['signin', { active: activeButton === 'sign-in' }]" @click="onSignIn">Iniciar Sesión</Button>
        <Button :class="['signup', { active: activeButton === 'sign-up' }]" @click="onSignUp">Registrarse</Button>
      </div>
      <div class="mobile-menu">
        <Button icon="pi pi-bars" @click="toggleMenu"></Button>
        <div :class="['dropdown-menu', { closing: closingMenu }]" v-if="showMenu">
          <Button :class="['signin', { active: activeButton === 'sign-in' }]" @click="onSignIn">Iniciar Sesión</Button>
          <Button :class="['signup', { active: activeButton === 'sign-up' }]" @click="onSignUp">Registrarse</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>


a {
  font-family: Nunito, sans-serif;
  text-decoration: none;
  font-size: 22px;
  padding: 0.6em;
  cursor: pointer;
  color: #2C3E50;
  background-color: rgba(126, 137, 64, 0);
  align-items: center;
  width: auto !important;
  border-radius: 2em;
}

.welcome {
  border: none;
}

.signin {
  color: #27AE60;
  font-size: 18px;
  border-color: #27AE60;
  background-color: rgba(39, 174, 96, 0);
  border-radius: 2em;
  padding: 15px 30px;
  cursor: pointer;
  margin-right: 1em;
  transition: background-color 0.3s ease, transform 0.3s ease;
}
.signin:hover {
  background-color: #27AE60;
  color: white;
  transform: scale(1.1);
}

.signup {
  background-color: #27AE60;
  color: #fff;
  font-size: 18px;
  border: none;
  border-radius: 2em;
  padding: 15px 30px;
  cursor: pointer;
  margin-right: 1em;
  transition: background-color 0.3s ease, transform 0.3s ease;
}
.signup:hover {
  background-color: #2cdc78;
  transform: scale(1.1);
}

.signout {
  color: indianred;
  font-weight: bolder;
  border: none;
  border-radius: 2em;
  padding: 13px;
  cursor: pointer;
  margin-right: 1em;
  transition: color 0.3s ease, transform 0.3s ease;
}

.signout:hover {
  color: #a41f12;
  transform: scale(1.05);
}

span {
  font-weight: 800 !important;
}

.desktop-buttons {
  display: flex;
}

.mobile-menu {
  display: none;
}

@media (max-width: 768px) {
  .desktop-buttons {
    display: none;
  }
  .mobile-menu {
    display: block;
  }
  .signin, .signup {
    display: block;
    margin: 0.5em;
  }
  .dropdown-menu {
    display: flex;
    flex-direction: column;
    position: absolute;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 5px;
    right: 0; /* Align the menu to the right of the container */
    transform: translateX(-0%); /* Move the menu to the left */
    transition: opacity 0.2s, transform 0.2s;
  }
  .dropdown-menu.closing {
    opacity: 0;
    transform: translateY(-10%);
  }
  .welcome {
    display: none; /* Hide the welcome message on mobile */
  }
}
</style>