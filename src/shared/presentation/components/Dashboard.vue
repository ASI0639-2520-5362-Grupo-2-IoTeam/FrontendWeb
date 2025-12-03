<script setup lang="ts">
import { useDashboard } from '../composables/useDashboard';
import Button from 'primevue/button';

const {
  loading,
  error,
  stats,
  recentActivities,
  nextWateringPlant,
  handleWaterNow,
  handleViewAll,
} = useDashboard();
</script>

<template>
  <div class="dashboard">
    <div v-if="loading" class="state-message">
      <p>Loading dashboard...</p>
    </div>

    <div v-else-if="error" class="state-message">
      <p>{{ error }}</p>
    </div>

    <template v-else>
      <div class="stats-grid">
        <div
            v-for="(stat, index) in stats"
            :key="stat.label || index"
            class="stat-card"
        >
          <div class="stat-header">
            <div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <span
                  v-if="stat.trend"
                  :class="['stat-trend', stat.trendUp ? 'up' : 'down']"
              >
                {{ stat.trendUp ? '↑' : '↓' }} {{ stat.trend }}
              </span>
            </div>
            <div class="stat-icon">{{ stat.icon }}</div>
          </div>
        </div>
      </div>

      <div v-if="nextWateringPlant" class="next-watering-card">
        <div class="next-watering-content">
          <div class="next-watering-label">Next Plant to Water</div>
          <div class="next-watering-plant">{{ nextWateringPlant.plantName }}</div>
          <div class="next-watering-time">{{ nextWateringPlant.timeDue }} • {{ nextWateringPlant.location }}</div>
        </div>
        <Button
            class="next-watering-button"
            label="Water Now"
            @click="handleWaterNow"
        />
      </div>

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
                :key="activity.title || index"
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
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.state-message {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: var(--text-secondary);
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
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: var(--gradient-primary);
  opacity: 0.02;
  transition: left 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-green);
}

.stat-card:hover::before {
  left: 0;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: var(--shadow-green);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: rotate(10deg) scale(1.1);
  box-shadow: var(--shadow-xl);
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--text-primary);
  line-height: 1;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 6px 10px;
  border-radius: var(--radius-full);
  margin-top: var(--spacing-sm);
}

.stat-trend.up {
  background: rgba(34, 197, 94, 0.12);
  color: var(--status-healthy, var(--primary-green));
}

.stat-trend.down {
  background: rgba(239, 68, 68, 0.12);
  color: var(--status-critical);
}

.next-watering-card {
  background: var(--gradient-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  color: #ffffff;
  box-shadow: var(--shadow-green);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.next-watering-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: -50%;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  transition: right 0.5s ease;
}

.next-watering-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.next-watering-card:hover::before {
  right: 0;
}

.next-watering-content {
  flex: 1;
}

.next-watering-label {
  font-size: var(--font-size-sm);
  opacity: 0.95;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.next-watering-plant {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-extrabold);
  margin-bottom: var(--spacing-sm);
  text-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.next-watering-time {
  font-size: var(--font-size-base);
  opacity: 0.95;
  font-weight: var(--font-weight-medium);
}

.next-watering-button {
  background: #ffffff !important;
  color: var(--primary-green) !important;
  padding: 14px 32px !important;
  border-radius: var(--radius-lg) !important;
  border: none !important;
  font-weight: var(--font-weight-bold) !important;
  font-size: var(--font-size-base) !important;
  cursor: pointer;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
}

.next-watering-button:hover {
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

.recent-activity {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.activity-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  position: relative;
}

.activity-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: var(--gradient-primary);
  opacity: 0.08;
  border-radius: var(--radius-lg);
  transition: width 0.3s ease;
}

.activity-item:hover {
  transform: translateX(4px);
}

.activity-item:hover::before {
  width: 100%;
}

.activity-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.activity-item:hover .activity-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: var(--shadow-md);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 4px;
  font-size: var(--font-size-base);
}

.activity-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.activity-time {
  font-size: var(--font-size-xs);
  color: var(--text-light);
  white-space: nowrap;
  font-weight: var(--font-weight-medium);
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
