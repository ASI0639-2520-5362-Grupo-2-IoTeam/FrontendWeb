<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Avatar from 'primevue/avatar';

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

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/plants', label: 'Plants', icon: '🌱' },
  { path: '/history', label: 'History', icon: '📅' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

const isActiveRoute = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

const handleNavClick = (path: string) => {
  router.push(path);
  emit('close');
};

const sidebarClass = computed(() => ({
  'sidebar': true,
  'open': props.isOpen
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
          <a
              :class="['nav-link', { active: isActiveRoute(item.path) }]"
              @click.prevent="handleNavClick(item.path)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </nav>

    <div class="footer">
      <div class="user-section">
        <Avatar
            label="JD"
            class="user-avatar"
            shape="circle"
        />
        <div class="user-info">
          <div class="user-name">John Doe</div>
          <div class="user-email">john@plantcare.com</div>
        </div>
      </div>
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