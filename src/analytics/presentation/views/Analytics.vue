
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthenticationStore } from '../../../iam/services/Authentication.Store.ts'
import { AnalyticsService } from '../../infrastructure/analytics.service.ts'
import { PlantsService } from '../../../plantmanagement/infrastructure/plats.services.ts'
import type { Analytics } from '../../domain/model/analytics.entity.ts'
import type { Plant } from '../../../plantmanagement/domain/model/plants.entity.ts'

interface Summary {
  avgHumidity: number
  avgSoilMoisture: number
  wateringCount: number
  criticalAlerts: number
}

// Services and stores
const authStore = useAuthenticationStore()
const analyticsService = new AnalyticsService()
const plantsService = new PlantsService()

// Reactive data
const loading = ref(false)
const analytics = ref<Analytics[]>([])
const plants = ref<Plant[]>([])
const summary = ref<Summary>({
  avgHumidity: 0,
  avgSoilMoisture: 0,
  wateringCount: 0,
  criticalAlerts: 0
})

// Computed properties for dashboard stats
const totalPlants = computed(() => plants.value.length)

const healthyPlants = computed(() => plants.value.filter(p => p.status === 'healthy').length)

const plantsNeedingAttention = computed(() => 
  plants.value.filter(p => p.status === 'warning' || p.status === 'critical').length
)

const healthDistribution = computed(() => {
  const total = plants.value.length || 1
  const healthy = plants.value.filter(p => p.status === 'healthy').length
  const warning = plants.value.filter(p => p.status === 'warning').length
  const critical = plants.value.filter(p => p.status === 'critical').length
  
  return {
    healthy: Math.round((healthy / total) * 100),
    warning: Math.round((warning / total) * 100),
    critical: Math.round((critical / total) * 100)
  }
})

// Mock data for charts (will be replaced with real data from analytics)
const wateringData = ref([
  { label: 'Jan', value: 45 },
  { label: 'Feb', value: 55 },
  { label: 'Mar', value: 60 },
  { label: 'Apr', value: 58 },
  { label: 'May', value: 65 },
  { label: 'Jun', value: 70 }
])

const humidityData = ref([
  { day: 'Mon', value: 65 },
  { day: 'Tue', value: 62 },
  { day: 'Wed', value: 68 },
  { day: 'Thu', value: 64 },
  { day: 'Fri', value: 70 },
  { day: 'Sat', value: 67 },
  { day: 'Sun', value: 65 }
])

const humidityPoints = computed(() => {
  return humidityData.value
    .map((point, i) => `${i * 50 + 25},${180 - point.value * 2}`)
    .join(' ')
})

const humidityAreaPoints = computed(() => {
  const points = humidityData.value
    .map((point, i) => `${i * 50 + 25},${180 - point.value * 2}`)
    .join(' ')
  return `25,180 ${points} 325,180`
})

const growthData = computed(() => {
  return plants.value.slice(0, 5).map(plant => ({
    name: plant.name,
    growth: Math.random() * 20 + 5 // Mock growth data
  }))
})

// Load data from infrastructure
const loadData = async () => {
  loading.value = true
  
  try {
    // Get logged user ID
    const userId = authStore.uuid || localStorage.getItem('userUuid')
    
    if (!userId) {
      console.warn('[Analytics] No logged user found')
      return
    }

    // Load plants and analytics in parallel
    const [plantsResponse, analyticsResponse] = await Promise.all([
      plantsService.getPlantsByUser(userId),
      analyticsService.getAnalyticsByUser(userId)
    ])

    plants.value = plantsResponse.data
    analytics.value = analyticsResponse.data

    // Calculate summary from analytics data
    if (analytics.value.length > 0) {
      const totalAnalytics = analytics.value.length
      const totals = analytics.value.reduce((acc, item) => ({
        avgHumidity: acc.avgHumidity + item.summary.avgHumidity,
        avgSoilMoisture: acc.avgSoilMoisture + item.summary.avgSoilMoisture,
        wateringCount: acc.wateringCount + item.summary.wateringCount,
        criticalAlerts: acc.criticalAlerts + item.summary.criticalAlerts
      }), { avgHumidity: 0, avgSoilMoisture: 0, wateringCount: 0, criticalAlerts: 0 })

      summary.value = {
        avgHumidity: Math.round(totals.avgHumidity / totalAnalytics),
        avgSoilMoisture: Math.round(totals.avgSoilMoisture / totalAnalytics),
        wateringCount: totals.wateringCount,
        criticalAlerts: totals.criticalAlerts
      }
    }

  } catch (error) {
    console.error('[Analytics] Error loading data:', error)
  } finally {
    loading.value = false
  }
}

// Initialize component
onMounted(async () => {
  // Initialize auth store if needed
  if (!authStore.isInitialized) {
    authStore.initialize()
  }
  
  // Wait for auth initialization
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Load analytics data
  await loadData()
})
</script>

<template>
  <div class="analytics-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <h1 class="title">Analytics & Reports</h1>
        <p class="subtitle">Track your plant care performance and growth trends</p>
      </div>
      <div class="date-badge">
        Last 30 Days
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <!-- Total plantmanagement Card -->
      <div class="card stats-card">
        <div class="card-content">
          <div class="stats-info">
            <p class="stats-label">Total Plants</p>
            <p class="stats-value">{{ totalPlants }}</p>
            <p class="stats-trend positive">+2 this month</p>
          </div>
          <div class="icon-container green">
            <i class="pi pi-leaf"></i>
          </div>
        </div>
      </div>

      <!-- Healthy plantmanagement Card -->
      <div class="card stats-card">
        <div class="card-content">
          <div class="stats-info">
            <p class="stats-label">Healthy Plants</p>
            <p class="stats-value">{{ healthyPlants }}</p>
            <p class="stats-trend positive">{{ healthDistribution.healthy }}% health rate</p>
          </div>
          <div class="icon-container green">
            <i class="pi pi-heart"></i>
          </div>
        </div>
      </div>

      <!-- Avg Humidity Card -->
      <div class="card stats-card">
        <div class="card-content">
          <div class="stats-info">
            <p class="stats-label">Avg Humidity</p>
            <p class="stats-value">{{ summary.avgHumidity }}%</p>
            <p class="stats-trend positive">+5% vs last week</p>
          </div>
          <div class="icon-container blue">
            <i class="pi pi-cloud"></i>
          </div>
        </div>
      </div>

      <!-- Need Attention Card -->
      <div class="card stats-card">
        <div class="card-content">
          <div class="stats-info">
            <p class="stats-label">Need Attention</p>
            <p class="stats-value">{{ plantsNeedingAttention }}</p>
            <p class="stats-trend negative">-1 vs yesterday</p>
          </div>
          <div class="icon-container orange">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Watering Frequency Chart Card -->
      <div class="card chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Watering Frequency</h3>
          <p class="chart-subtitle">Monthly watering sessions vs optimal targets</p>
        </div>
        <div class="chart-container bar-chart">
          <div v-for="month in wateringData" :key="month.label" class="bar-item">
            <div class="bar green-bar" :style="{ height: `${month.value * 3}px` }"></div>
            <span class="bar-label">{{ month.label }}</span>
          </div>
        </div>
      </div>

      <!-- Plant Health Distribution Chart Card -->
      <div class="card chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Plant Health Distribution</h3>
          <p class="chart-subtitle">Current status of all your plants</p>
        </div>
        <div class="chart-container pie-chart">
          <div class="pie-chart-wrapper">
            <svg viewBox="0 0 100 100" class="pie-svg">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#86efac" stroke-width="12" 
                      :stroke-dasharray="`${healthDistribution.healthy} ${100 - healthDistribution.healthy}`" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#fbbf24" stroke-width="12" 
                      :stroke-dasharray="`${healthDistribution.warning} ${100 - healthDistribution.warning}`"
                      :stroke-dashoffset="`${-healthDistribution.healthy}`" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#ef4444" stroke-width="12" 
                      :stroke-dasharray="`${healthDistribution.critical} ${100 - healthDistribution.critical}`"
                      :stroke-dashoffset="`${-(healthDistribution.healthy + healthDistribution.warning)}`" />
            </svg>
          </div>
        </div>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-dot green"></div>
            <span class="legend-text">Healthy ({{ healthyPlants }})</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot yellow"></div>
            <span class="legend-text">Warning ({{ plants.filter(p => p.status === 'warning').length }})</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot red"></div>
            <span class="legend-text">Critical ({{ plants.filter(p => p.status === 'critical').length }})</span>
          </div>
        </div>
      </div>

      <!-- Weekly Humidity Trends Chart Card -->
      <div class="card chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Weekly Humidity Trends</h3>
          <p class="chart-subtitle">Average humidity levels across all plants</p>
        </div>
        <div class="chart-container line-chart">
          <svg class="line-svg" viewBox="0 0 350 180">
            <defs>
              <linearGradient id="humidityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#22c55e;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#22c55e;stop-opacity:0" />
              </linearGradient>
            </defs>
            <polygon :points="humidityAreaPoints" fill="url(#humidityGradient)" />
            <polyline
              :points="humidityPoints"
              fill="none"
              stroke="#22c55e"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle v-for="(point, i) in humidityData" :key="i"
              :cx="i * 50 + 25"
              :cy="180 - point.value * 2"
              r="4"
              fill="#22c55e"
              stroke="#ffffff"
              stroke-width="2"
            />
          </svg>
          <div class="chart-labels">
            <span v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="day" 
                  class="day-label">{{ day }}</span>
          </div>
        </div>
      </div>

      <!-- Plant Growth Comparison Chart Card -->
      <div class="card chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Plant Growth Comparison</h3>
          <p class="chart-subtitle">Growth percentage over the last month</p>
        </div>
        <div class="chart-container bar-chart">
          <div v-for="plant in growthData" :key="plant.name" class="bar-item">
            <div class="bar purple-bar" :style="{ height: `${plant.growth * 8}px` }"></div>
            <span class="bar-label">{{ plant.name.split(' ')[0] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Reports Card -->
    <div class="card reports-card">
      <div class="chart-header">
        <h3 class="chart-title">Quick Reports</h3>
        <p class="chart-subtitle">Generate detailed reports for your plant care data</p>
      </div>
      
      <div class="reports-grid">
        <!-- Watering Report -->
        <div class="report-item green-report">
          <div class="report-icon green">
            <i class="pi pi-cloud"></i>
          </div>
          <div class="report-content">
            <h4 class="report-title">Watering Report</h4>
            <p class="report-description">Monthly watering summary and recommendations</p>
          </div>
        </div>

        <!-- Health Report -->
        <div class="report-item blue-report">
          <div class="report-icon blue">
            <i class="pi pi-heart"></i>
          </div>
          <div class="report-content">
            <h4 class="report-title">Health Report</h4>
            <p class="report-description">Comprehensive plant health analysis and insights</p>
          </div>
        </div>

        <!-- Growth Report -->
        <div class="report-item purple-report">
          <div class="report-icon purple">
            <i class="pi pi-chart-line"></i>
          </div>
          <div class="report-content">
            <h4 class="report-title">Growth Report</h4>
            <p class="report-description">Detailed growth tracking and trend analysis</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container */
.analytics-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 1.5rem;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.header-content {
  flex: 1;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
}

.subtitle {
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
}

.date-badge {
  padding: 0.5rem 1rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Cards */
.card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stats-card .card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stats-info {
  flex: 1;
}

.stats-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.stats-value {
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
}

.stats-trend {
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

.stats-trend.positive {
  color: #059669;
}

.stats-trend.negative {
  color: #dc2626;
}

/* Icon Containers */
.icon-container {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.icon-container.green {
  background-color: #dcfce7;
  color: #059669;
}

.icon-container.blue {
  background-color: #dbeafe;
  color: #2563eb;
}

.icon-container.orange {
  background-color: #fed7aa;
  color: #ea580c;
}

.icon-container.purple {
  background-color: #e9d5ff;
  color: #9333ea;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  min-height: 350px;
}

.chart-header {
  margin-bottom: 1rem;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Chart Containers */
.chart-container {
  height: 240px;
  position: relative;
}

/* Bar Charts */
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 0;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar {
  width: 100%;
  border-radius: 0.25rem 0.25rem 0 0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
}

.bar:hover {
  transform: translateY(-2px);
}

.green-bar {
  background: linear-gradient(to top, #22c55e, #16a34a);
}

.purple-bar {
  background: linear-gradient(to top, #a855f7, #9333ea);
}

.bar-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  font-weight: 500;
}

/* Pie Chart */
.pie-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 192px;
}

.pie-chart-wrapper {
  position: relative;
  width: 8rem;
  height: 8rem;
}

.pie-svg {
  transform: rotate(-90deg);
}

/* Legend */
.legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.legend-dot.green {
  background-color: #86efac;
}

.legend-dot.yellow {
  background-color: #fbbf24;
}

.legend-dot.red {
  background-color: #ef4444;
}

.legend-text {
  font-size: 0.875rem;
  color: #374151;
}

/* Line Chart */
.line-chart {
  height: 192px;
  position: relative;
}

.line-svg {
  width: 100%;
  height: 100%;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding: 0 0.5rem;
}

.day-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* Reports */
.reports-card {
  margin-bottom: 1.5rem;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.report-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.report-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.report-item.green-report:hover {
  border-color: #22c55e;
  background-color: #f0fdf4;
}

.report-item.blue-report:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.report-item.purple-report:hover {
  border-color: #a855f7;
  background-color: #faf5ff;
}

.report-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease-in-out;
}

.report-item:hover .report-icon {
  transform: scale(1.05);
}

.report-icon.green {
  background-color: #dcfce7;
  color: #059669;
}

.report-icon.blue {
  background-color: #dbeafe;
  color: #2563eb;
}

.report-icon.purple {
  background-color: #e9d5ff;
  color: #9333ea;
}

.report-content {
  flex: 1;
}

.report-title {
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  transition: color 0.2s ease-in-out;
}

.green-report:hover .report-title {
  color: #059669;
}

.blue-report:hover .report-title {
  color: #2563eb;
}

.purple-report:hover .report-title {
  color: #9333ea;
}

.report-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .analytics-container {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
  }
  
  .legend {
    gap: 0.5rem;
  }
  
  .legend-item {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.25rem;
  }
  
  .stats-value {
    font-size: 1.5rem;
  }
  
  .card {
    padding: 1rem;
  }
  
  .chart-container {
    height: 180px;
  }
  
  .chart-card {
    min-height: 280px;
  }
}
</style>
