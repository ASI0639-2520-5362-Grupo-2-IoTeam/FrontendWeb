<script setup lang="ts">
import { ref, computed } from 'vue';
import Dropdown from 'primevue/dropdown';

interface HistoryItem {
  id: number;
  icon: string;
  action: string;
  plant: string;
  time: string;
  type: 'watering' | 'alert' | 'photo' | 'add' | 'care' | 'check';
}

const selectedPlant = ref('All Plants');
const selectedAction = ref('All Actions');

const plantOptions = ref([
  { label: 'All Plants', value: 'All Plants' },
  { label: 'Monstera Deliciosa', value: 'Monstera Deliciosa' },
  { label: 'Snake Plant', value: 'Snake Plant' },
  { label: 'Peace Lily', value: 'Peace Lily' },
]);

const actionOptions = ref([
  { label: 'All Actions', value: 'All Actions' },
  { label: 'Watering', value: 'Watering' },
  { label: 'Alerts', value: 'Alerts' },
  { label: 'Care Tasks', value: 'Care Tasks' },
]);

const historyItems = ref<HistoryItem[]>([
  { id: 1, icon: '💧', action: 'Watered', plant: 'Monstera Deliciosa', time: '2 hours ago', type: 'watering' },
  { id: 2, icon: '⚠️', action: 'Low Humidity Alert', plant: 'Snake Plant', time: '4 hours ago', type: 'alert' },
  { id: 3, icon: '📷', action: 'Added Photo', plant: 'Peace Lily', time: 'Yesterday', type: 'photo' },
  { id: 4, icon: '💧', action: 'Watered', plant: 'Fiddle Leaf Fig', time: 'Yesterday', type: 'watering' },
  { id: 5, icon: '🌱', action: 'Added New Plant', plant: 'Pothos', time: '2 days ago', type: 'add' },
  { id: 6, icon: '✅', action: 'Fertilized', plant: 'Rubber Plant', time: '2 days ago', type: 'care' },
  { id: 7, icon: '📊', action: 'Health Check', plant: 'All Plants', time: '3 days ago', type: 'check' },
  { id: 8, icon: '💧', action: 'Watered', plant: 'Snake Plant', time: '1 week ago', type: 'watering' },
]);

const filteredHistory = computed(() => {
  let result = historyItems.value;

  if (selectedPlant.value !== 'All Plants') {
    result = result.filter(item => item.plant === selectedPlant.value);
  }

  if (selectedAction.value !== 'All Actions') {
    const actionMap: { [key: string]: string[] } = {
      'Watering': ['Watered'],
      'Alerts': ['Low Humidity Alert'],
      'Care Tasks': ['Fertilized', 'Health Check'],
    };

    const actions = actionMap[selectedAction.value] || [];
    result = result.filter(item => actions.includes(item.action));
  }

  return result;
});
</script>

<template>
  <div class="history">
    <div class="header">
      <h1 class="title">Activity History</h1>
      <div class="filter-group">
        <Dropdown
            v-model="selectedPlant"
            :options="plantOptions"
            optionLabel="label"
            optionValue="value"
            class="filter-select"
        />
        <Dropdown
            v-model="selectedAction"
            :options="actionOptions"
            optionLabel="label"
            optionValue="value"
            class="filter-select"
        />
      </div>
    </div>

    <div class="timeline">
      <div
          v-for="item in filteredHistory"
          :key="item.id"
          class="timeline-item"
      >
        <div :class="['timeline-icon', item.type]">
          {{ item.icon }}
        </div>
        <div class="timeline-content">
          <div class="timeline-header">
            <h3 class="timeline-action">{{ item.action }}</h3>
            <span class="timeline-time">{{ item.time }}</span>
          </div>
          <p class="timeline-plant">{{ item.plant }}</p>
        </div>
      </div>
    </div>

    <div v-if="filteredHistory.length === 0" class="empty-state">
      <p class="empty-message">No history items found for the selected filters.</p>
    </div>
  </div>
</template>

<style scoped>
.history {
  max-width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.filter-group {
  display: flex;
  gap: var(--spacing-md);
}

.filter-select {
  width: 200px;
}

.filter-select :deep(.p-dropdown) {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.filter-select :deep(.p-dropdown:hover) {
  border-color: var(--primary-green);
}

.filter-select :deep(.p-dropdown-label) {
  padding: 10px 16px;
}

.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-color);
}

.timeline-item {
  position: relative;
  margin-bottom: var(--spacing-xl);
  display: flex;
  gap: var(--spacing-lg);
}

.timeline-icon {
  position: absolute;
  left: -28px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--bg-card);
  border: 3px solid var(--border-color);
  z-index: 1;
}

.timeline-icon.watering {
  border-color: var(--primary-green);
  background: rgba(138, 199, 61, 0.15);
}

.timeline-icon.alert {
  border-color: var(--status-warning);
  background: rgba(245, 158, 11, 0.15);
}

.timeline-icon.photo,
.timeline-icon.add {
  border-color: var(--secondary-green);
  background: rgba(133, 184, 143, 0.15);
}

.timeline-icon.care,
.timeline-icon.check {
  border-color: var(--accent-dark, #03383c);
  background: rgba(3, 56, 60, 0.15);
}

.timeline-content {
  flex: 1;
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.timeline-content:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xs);
}

.timeline-action {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.timeline-time {
  font-size: var(--font-size-xs);
  color: var(--text-light);
  white-space: nowrap;
}

.timeline-plant {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-message {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .filter-group {
    width: 100%;
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }
}
</style>