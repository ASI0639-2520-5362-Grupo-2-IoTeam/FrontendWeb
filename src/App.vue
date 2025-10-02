<template>
  <div class="app-layout">
    <Sidebar class="sidebar-fixed" />
    <div class="main-content">
      <Header class="header-fixed" @menu-click="handleMenu" />
      <div class="router-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from "./shared/components/Header.vue";
import Sidebar from "./shared/components/Sidebar.vue";

const handleMenu = () => {
  console.log('Menu clicked');
};
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
