<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';

interface Stat {
  icon: string;
  value: string;
  label: string;
  trend: string;
  trendUp: boolean;
}

interface Activity {
  icon: string;
  title: string;
  description: string;
  time: string;
}

const stats = ref<Stat[]>([
  { icon: '🌱', value: '24', label: 'Total Plants', trend: '+3 this month', trendUp: true },
  { icon: '⚠️', value: '2', label: 'Active Alerts', trend: '-1 from last week', trendUp: false },
  { icon: '💧', value: '68%', label: 'Avg Humidity', trend: '+5% this week', trendUp: true },
  { icon: '✅', value: '95%', label: 'Health Score', trend: 'Excellent', trendUp: true },
]);

const recentActivities = ref<Activity[]>([
  { icon: '💧', title: 'Watered Monstera', description: 'Completed watering task', time: '2 hours ago' },
  { icon: '🌡️', title: 'Low Humidity Alert', description: 'Snake Plant needs attention', time: '4 hours ago' },
  { icon: '📷', title: 'Added New Plant', description: 'Peace Lily added to collection', time: 'Yesterday' },
  { icon: '✅', title: 'Fertilized Ficus', description: 'Monthly feeding completed', time: '2 days ago' },
]);

const handleWaterNow = () => {
  console.log('Watering plant...');
};

const handleViewAll = () => {
  console.log('View all activities...');
};
</script>

<template>
  <div class="dashboard">
    <!-- Stats Overview -->
    <div class="stats-grid">
      <div
          v-for="(stat, index) in stats"
          :key="index"
          class="stat-card"
      >
        <div class="stat-header">
          <div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <span
                :class="['stat-trend', stat.trendUp ? 'up' : 'down']"
            >
              {{ stat.trendUp ? '↑' : '↓' }} {{ stat.trend }}
            </span>
          </div>
          <div class="stat-icon">{{ stat.icon }}</div>
        </div>
      </div>
    </div>

    <!-- Next Plant to Water -->
    <div class="next-watering-card">
      <div class="next-watering-content">
        <div class="next-watering-label">Next Plant to Water</div>
        <div class="next-watering-plant">🌿 Fiddle Leaf Fig</div>
        <div class="next-watering-time">Due in 2 hours • Living Room</div>
      </div>
      <Button
          class="next-watering-button"
          label="Water Now"
          @click="handleWaterNow"
      />
    </div>

    <!-- Recent Activity -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Recent Activity</h2>
        <Button
            label="View All"
            outlined
            @click="handleViewAll"
        />
      </div>

      <div class="recent-activity">
        <div class="activity-list">
          <div
              v-for="(activity, index) in recentActivities"
              :key="index"
              class="activity-item"
          >
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-description">{{ activity.description }}</div>
            </div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.section {
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: rgba(138, 199, 61, 0.15);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 4px 8px;
  border-radius: 12px;
  margin-top: var(--spacing-sm);
}

.stat-trend.up {
  background: rgba(138, 199, 61, 0.15);
  color: var(--status-healthy, var(--primary-green));
}

.stat-trend.down {
  background: rgba(239, 68, 68, 0.15);
  color: var(--status-critical);
}

.next-watering-card {
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green, #7ab32d) 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  color: #ffffff;
  box-shadow: var(--shadow-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
}

.next-watering-content {
  flex: 1;
}

.next-watering-label {
  font-size: var(--font-size-sm);
  opacity: 0.9;
  margin-bottom: var(--spacing-sm);
}

.next-watering-plant {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
}

.next-watering-time {
  font-size: var(--font-size-base);
  opacity: 0.95;
}

.next-watering-button {
  background: #ffffff !important;
  color: var(--primary-green) !important;
  padding: 12px 32px;
  border-radius: var(--radius-md);
  border: none !important;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.next-watering-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
}

.recent-activity {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.activity-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: background 0.2s ease;
}

.activity-item:hover {
  background: rgba(138, 199, 61, 0.05);
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: rgba(138, 199, 61, 0.15);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 4px;
}

.activity-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.activity-time {
  font-size: var(--font-size-xs);
  color: var(--text-light);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .next-watering-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-lg);
  }

  .next-watering-button {
    width: 100%;
  }
}
</style>