<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Avatar from 'primevue/avatar';
import { useAuthenticationStore } from '../../IAM/services/Authentication.Store.ts';

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
  { path: '/plants', name: 'Plants', label: 'Plants', icon: '🌱' },
  { path: '/history', name: 'History', label: 'History', icon: '📅' },
  { path: '/settings', name: 'Settings', label: 'Settings', icon: '⚙️' },
  { path: '/profile', name: 'Profile', label: 'Profile', icon: '👤' },
  { path: '/analytics', name: 'Analytics', label: 'Analytics', icon: '📈' },
];

const isActiveRoute = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

const handleNavClick = (item: { path: string; name?: string }) => {
  console.debug('[Sidebar] navigate to', item);
  if (item.name) {
    router.push({ name: item.name as any });
  } else {
    router.push(item.path);
  }
  emit('close');
};

const handleLogout = () => {
  try {
    authStore.signOut();
  } catch (e) { /* ignore */ }
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('email');
  localStorage.removeItem('role');
  router.push({ name: 'SignIn' });
};

const sidebarClass = computed(() => ({
  'sidebar': true,
  'open': props.isOpen
}));

const userName = computed(() => {
  // Preferiblemente obtén nombre desde el store si existe (no hay campo nombre, usamos email o id)
  if (authStore.email) return authStore.email.split('@')[0];
  if (authStore.id) return `User-${authStore.id.substring(0,6)}`;
  return 'Guest';
});

const userEmail = computed(() => authStore.email ?? '—');

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
        <div class="logo-icon">🌿</div>
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
        <Avatar
            :label="(userName)"
            class="user-avatar"
            shape="circle"
        />
        <div class="user-info">
          <div class="user-name">{{ userName }}</div>
          <div class="user-email">{{ userEmail }}</div>
          <div class="user-id">ID: {{ authStore.id ?? '—' }}</div>
        </div>
        <div :class="authStatusClass" :title="authStore.isSignedIn ? 'Signed in' : 'Signed out'"></div>
      </div>
      <button class="logout-btn" @click="handleLogout">Cerrar sesión</button>
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
  transition: transform 0.3s ease;
}

.logo {
  padding: var(--spacing-xl) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.logo-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-green);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
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
}

.nav-item {
  margin-bottom: var(--spacing-xs);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 12px var(--spacing-lg);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: var(--font-weight-normal);
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  cursor: pointer;
}

.nav-link:hover {
  background: rgba(138, 199, 61, 0.08);
  color: var(--text-primary);
}

.nav-link.active {
  background: rgba(138, 199, 61, 0.12);
  color: var(--primary-green);
  border-left-color: var(--primary-green);
  font-weight: var(--font-weight-semibold);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-section:hover {
  box-shadow: var(--shadow-sm);
}

.user-avatar {
  width: 40px !important;
  height: 40px !important;
  background: var(--primary-green) !important;
  color: #ffffff !important;
  font-weight: var(--font-weight-bold) !important;
  flex-shrink: 0;
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

.user-email {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-id {
  font-size: 11px;
  color: var(--text-light);
  margin-top: 4px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 8px;
}

.status-dot.online { background: var(--status-healthy); }
.status-dot.offline { background: var(--status-warning); }

.logout-btn {
  width: 100%;
  margin-top: var(--spacing-md);
  padding: 10px 0;
  background: var(--status-critical);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #c0392b;
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
    box-shadow: var(--shadow-lg);
  }
}
</style>