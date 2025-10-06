<template>
  <div>
    <div v-if="showLayout" class="app-layout">
      <Sidebar class="sidebar-fixed" />
      <div class="main-content">
        <Header class="header-fixed" @menu-click="handleMenu" />
        <div class="router-content">
          <router-view />
        </div>
      </div>
    </div>
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "./shared/components/Header.vue";
import Sidebar from "./shared/components/Sidebar.vue";
import { useRoute} from 'vue-router';
import { computed } from 'vue';

const handleMenu = () => {
  console.log('Menu clicked');
};

const route = useRoute();

const showLayout = computed(() => {
  // Mostrar layout solo si la ruta NO tiene meta.hideLayout === true
  return !route.meta?.hideLayout;
});
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 240px;
  z-index: 100;
}

.main-content {
  margin-left: 240px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header-fixed {
  position: fixed;
  top: 0;
  left: 240px;
  right: 0;
  height: 64px;
  z-index: 101;
}

.router-content {
  margin-top: 64px;
  padding: 24px;
}
</style>
