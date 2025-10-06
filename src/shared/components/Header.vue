<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Avatar from 'primevue/avatar';
import { useRouter } from 'vue-router';

const emit = defineEmits<{
  menuClick: [];
}>();

const theme = ref<'light' | 'dark'>('light');

const toggleTheme = () => {
  const newTheme = theme.value === 'light' ? 'dark' : 'light';
  theme.value = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
};

const handleMenuClick = () => {
  emit('menuClick');
};

const router = useRouter();


const goToProfile = () => {
  router.push('/profile');
};
</script>

<template>
  <header class="header">
    <div class="header-left">
      <Button
          class="menu-button"
          text
          @click="handleMenuClick"
          aria-label="Menu"
      >
        <span class="menu-icon">☰</span>
      </Button>
      <h1 class="greeting">Hello, John! 👋</h1>
    </div>

    <div class="header-right">
      <Button
          class="theme-toggle"
          outlined
          @click="toggleTheme"
      >
        <span class="theme-icon">{{ theme === 'light' ? '🌙' : '☀️' }}</span>
        <span>{{ theme === 'light' ? 'Dark' : 'Light' }}</span>
      </Button>

      <Button
          class="notification-button"
          outlined
          aria-label="Notifications"
      >
        <span class="notification-icon">🔔</span>
        <Badge value="3" severity="danger" class="notification-badge" />
      </Button>
      <Avatar
        label="JD"
        shape="circle"
        size="large"
        class="header-avatar"
        style="cursor:pointer; margin-left:16px;"
        @click="goToProfile"
      />
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-lg) var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.menu-button {
  display: none;
  background: none !important;
  border: none !important;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-primary);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: background 0.2s ease;
}

.menu-button:hover {
  background: rgba(138, 199, 61, 0.1) !important;
}

.menu-icon {
  font-size: 24px;
}

.greeting {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.theme-toggle {
  background: var(--bg-primary) !important;
  border: 1px solid var(--border-color) !important;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-primary) !important;
  font-weight: var(--font-weight-semibold);
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  border-color: var(--primary-green) !important;
  box-shadow: var(--shadow-sm);
}

.theme-icon {
  display: flex;
  align-items: center;
}

.notification-button {
  position: relative;
  background: var(--bg-primary) !important;
  border: 1px solid var(--border-color) !important;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
  padding: 0;
}

.notification-button:hover {
  border-color: var(--primary-green) !important;
  box-shadow: var(--shadow-sm);
}

.notification-icon {
  font-size: 18px;
}

.notification-badge {
  position: absolute !important;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
}

.header-avatar {
  cursor: pointer;
}


@media (max-width: 768px) {
  .menu-button {
    display: flex;
  }

  .greeting {
    font-size: var(--font-size-lg);
  }

  .header {
    padding: var(--spacing-md) var(--spacing-lg);
  }
}
</style>