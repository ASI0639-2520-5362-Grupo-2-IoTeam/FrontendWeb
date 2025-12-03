<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { useAuthenticationStore} from "../../../iam/services/Authentication.Store.ts";
import logo from '../../../assets/pc_logo_green.png'

interface SidebarProps {
  isOpen?: boolean;
}

const props = withDefaults(defineProps<SidebarProps>(), {
  isOpen: true
});

const emit = defineEmits<{
  close: [];
}>();

const router = useRouter();
const route = useRoute();
const authStore = useAuthenticationStore();

const navItems = [
  { path: '/dashboard', name: 'Dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/plants', name: 'PlantsList', label: 'Plants', icon: '🌱' },
  { path: '/settings', name: 'Settings', label: 'Settings', icon: '⚙️' },
  { path: '/profile', name: 'Profile', label: 'Profile', icon: '👤' },
  { path: '/analytics', name: 'Analytics', label: 'Analytics', icon: '📈' },
  { path: '/community', name: 'Community', label: 'Community', icon: '👥' },
];

const isActiveRoute = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

const handleLogout = () => {
  try {
    authStore.signOut();
  } catch (e) { /* ignore */ }
  localStorage.removeItem('token');
  localStorage.removeItem('userUuid');
  localStorage.removeItem('email');
  localStorage.removeItem('role');
  router.push({ name: 'SignIn' });
};

const sidebarClass = computed(() => ({
  'sidebar': true,
  'open': props.isOpen
}));

const userName = computed(() => {

  if (authStore.email) return authStore.email.split('@')[0];
  if (authStore.uuid) return `User-${authStore.uuid.substring(0,6)}`;
  return 'Guest';
});



const authStatusClass = computed(() => ({
  'status-dot': true,
  'online': authStore.isSignedIn,
  'offline': !authStore.isSignedIn
}));
</script>

<template>
  <aside :class="sidebarClass">
    <div class="logo">
      <div class="logo-content">
        <div class="logo-icon-wrapper">
          <img :src="logo" alt="PlantCare Logo" class="logo-icon" />
        </div>
        <span class="logo-text">PlantCare</span>
      </div>
    </div>

    <nav class="nav">
      <ul class="nav-list">
        <li
            v-for="item in navItems"
            :key="item.path"
            class="nav-item"
        >
          <router-link
              :to="{ name: item.name }"
              class="nav-link"
              :class="{ active: isActiveRoute(item.path) }"
              @click="emit('close')"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="footer">
      <div class="user-section">
        <div class="user-info">
          <div class="user-name">{{ userName }}</div>
        </div>
        <div :class="authStatusClass" :title="authStore.isSignedIn ? 'Signed in' : 'Signed out'"></div>
      </div>
      <button class="logout-btn" @click="handleLogout">
        <span class="logout-icon">🚪</span>
        <span>Cerrar sesión</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background: var(--bg-sidebar, var(--bg-card));
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.logo {
  padding: var(--spacing-xl) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, transparent 0%, rgba(34, 197, 94, 0.03) 100%);
}

.logo-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--gradient-primary);
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-green);
  transition: all 0.3s ease;
}

.logo-icon-wrapper:hover {
  transform: rotate(10deg) scale(1.05);
  box-shadow: var(--shadow-lg);
}

.logo-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.nav {
  flex: 1;
  padding: var(--spacing-lg) 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 14px var(--spacing-lg);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 3px solid transparent;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: var(--gradient-primary);
  opacity: 0.08;
  transition: width 0.3s ease;
}

.nav-link:hover::before {
  width: 100%;
}

.nav-link:hover {
  color: var(--text-primary);
  transform: translateX(4px);
}

.nav-link.active {
  color: var(--primary-green);
  background: var(--primary-green-light);
  border-left-color: var(--primary-green);
  font-weight: var(--font-weight-semibold);
}

.nav-link.active::before {
  width: 100%;
}

.nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: transform 0.2s ease;
}

.nav-link:hover .nav-icon {
  transform: scale(1.15);
}

.footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background: linear-gradient(0deg, rgba(34, 197, 94, 0.02) 0%, transparent 100%);
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.user-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: var(--gradient-primary);
  opacity: 0.05;
  transition: left 0.3s ease;
}

.user-section:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--primary-green);
}

.user-section:hover::before {
  left: 0;
}



.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}



.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 8px;
  position: relative;
}

.status-dot::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.3;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-dot.online { 
  background: var(--status-healthy);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}
.status-dot.offline { 
  background: var(--status-warning);
  animation: none;
}

.logout-btn {
  width: 100%;
  margin-top: var(--spacing-md);
  padding: 12px 16px;
  background: var(--gradient-warm);
  color: #fff;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
}

.logout-btn:active {
  transform: translateY(0);
}

.logout-icon {
  font-size: 18px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
    box-shadow: var(--shadow-2xl);
  }
}
</style>
