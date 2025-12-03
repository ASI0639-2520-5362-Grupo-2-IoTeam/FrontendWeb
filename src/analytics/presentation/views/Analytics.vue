
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthenticationStore } from '../../../iam/services/Authentication.Store.ts'
import { AnalyticsService } from '../../infrastructure/analytics.service.ts'
import { PlantsService } from '../../../plants/infrastructure/plants.services.ts'
import type { Analytics } from '../../domain/model/analytics.entity.ts'
import type { Plant } from '../../../plants/domain/model/plants.entity.ts'

interface Summary {
  avgTemperature: number
  avgHumidity: number
  avgSoilMoisture: number
  avgLight: number
  totalReadings: number
}

// Services and stores
const authStore = useAuthenticationStore()
const analyticsService = new AnalyticsService()
const plantsService = new PlantsService()

// Reactive data
const loading = ref(false)
const loadingHistory = ref(false)
const error = ref<string | null>(null)
const analytics = ref<Analytics[]>([])
const plants = ref<Plant[]>([])
const historicalData = ref<any>(null)
const summary = ref<Summary>({
  avgTemperature: 0,
  avgHumidity: 0,
  avgSoilMoisture: 0,
  avgLight: 0,
  totalReadings: 0
})

// Check if we have analytics data
const hasAnalytics = computed(() => analytics.value.length > 0)
const hasHistoricalData = computed(() => historicalData.value !== null && historicalData.value.count > 0)

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

// Temperature data from latest readings
const temperatureData = computed(() => {
  if (analytics.value.length === 0) return []
  
  return analytics.value.slice(0, 7).map((item, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || `Day ${index + 1}`,
    value: item.summary.avgTemperature
  }))
})

const temperaturePoints = computed(() => {
  const data = temperatureData.value
  if (data.length === 0) return '25,90'
  
  const maxTemp = Math.max(...data.map(d => d.value), 1)
  return data
    .map((point, i) => `${i * 50 + 25},${180 - (point.value / maxTemp) * 150}`)
    .join(' ')
})

const temperatureAreaPoints = computed(() => {
  const points = temperaturePoints.value
  if (!points || points === '25,90') return '25,180 25,180'
  return `25,180 ${points} ${(temperatureData.value.length - 1) * 50 + 25},180`
})

// Humidity data from analytics
const humidityData = computed(() => {
  if (analytics.value.length === 0) return []
  
  return analytics.value.slice(0, 7).map((item, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || `Day ${index + 1}`,
    value: item.summary.avgHumidity
  }))
})

const humidityPoints = computed(() => {
  const data = humidityData.value
  if (data.length === 0) return '25,90'
  
  return data
    .map((point, i) => `${i * 50 + 25},${180 - (point.value * 1.5)}`)
    .join(' ')
})

const humidityAreaPoints = computed(() => {
  const points = humidityPoints.value
  if (!points || points === '25,90') return '25,180 25,180'
  return `25,180 ${points} ${(humidityData.value.length - 1) * 50 + 25},180`
})

// Load data from infrastructure
const loadData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Get logged user ID
    const userId = authStore.uuid || localStorage.getItem('userUuid')
    
    if (!userId) {
      console.warn('[Analytics] No logged user found')
      error.value = 'User not authenticated. Please log in.'
      return
    }

    console.log('[Analytics] Loading data for user:', userId)

    // Load plants first
    const plantsResponse = await plantsService.getPlantsByUser(userId)
    plants.value = plantsResponse.data

    console.log('[Analytics] Loaded plants:', plants.value.length)

    // Calculate analytics from plant metrics
    analytics.value = plants.value
      .filter(plant => plant.metrics && plant.metrics.length > 0)
      .map(plant => {
        const deviceId = plant.metrics.length > 0 ? plant.metrics[0]?.deviceId : undefined
        return analyticsService.calculateAnalyticsFromMetrics(plant.id, plant.metrics, deviceId)
      })

    console.log('[Analytics] Calculated analytics:', analytics.value.length)

    // Calculate overall summary from all analytics
    if (analytics.value.length > 0) {
      const totalAnalytics = analytics.value.length
      const totals = analytics.value.reduce((acc, item) => ({
        avgTemperature: acc.avgTemperature + item.summary.avgTemperature,
        avgHumidity: acc.avgHumidity + item.summary.avgHumidity,
        avgSoilMoisture: acc.avgSoilMoisture + item.summary.avgSoilMoisture,
        avgLight: acc.avgLight + item.summary.avgLight,
        totalReadings: acc.totalReadings + item.summary.totalReadings
      }), { 
        avgTemperature: 0, 
        avgHumidity: 0, 
        avgSoilMoisture: 0, 
        avgLight: 0, 
        totalReadings: 0 
      })

      summary.value = {
        avgTemperature: Math.round(totals.avgTemperature / totalAnalytics),
        avgHumidity: Math.round(totals.avgHumidity / totalAnalytics),
        avgSoilMoisture: Math.round(totals.avgSoilMoisture / totalAnalytics),
        avgLight: Math.round(totals.avgLight / totalAnalytics),
        totalReadings: totals.totalReadings
      }

      console.log('[Analytics] Summary calculated:', summary.value)
    } else {
      console.log('[Analytics] No analytics data available - using defaults')
    }

  } catch (err: any) {
    console.error('[Analytics] Error loading data:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load analytics data'
  } finally {
    loading.value = false
  }
}

// Load historical averages (last 5 readings)
const loadHistoricalData = async () => {
  loadingHistory.value = true
  
  try {
    console.log('[Analytics] Loading historical averages...')
    const response = await analyticsService.getRecentAverages(5)
    historicalData.value = response.data
    
    console.log('[Analytics] Historical data loaded:', historicalData.value)
  } catch (err: any) {
    console.error('[Analytics] Error loading historical data:', err)
    // Don't set error for historical data, it's optional
  } finally {
    loadingHistory.value = false
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
  
  // Load analytics data and historical data in parallel
  await Promise.all([
    loadData(),
    loadHistoricalData()
  ])
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

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading analytics data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state card">
      <div class="error-icon">
        <i class="pi pi-exclamation-circle"></i>
      </div>
      <h3>Unable to Load Analytics</h3>
      <p>{{ error }}</p>
      <button @click="loadData" class="retry-button">
        <i class="pi pi-refresh"></i> Retry
      </button>
    </div>

    <!-- Empty State (No Analytics) -->
    <div v-else-if="!hasAnalytics && !loading" class="empty-state card">
      <div class="empty-icon">
        <i class="pi pi-chart-line"></i>
      </div>
      <h3>No Analytics Data Available</h3>
      <p>Analytics data will appear here once your plants start generating activity data.</p>
      <p class="empty-hint">Make sure you have plants added and they are being monitored.</p>
    </div>

    <!-- Main Content (When Data is Available) -->
    <template v-else>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <!-- Total plants Card -->
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

      <!-- Healthy plants Card -->
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
            <p class="stats-trend positive">Ambient level</p>
          </div>
          <div class="icon-container blue">
            <i class="pi pi-cloud"></i>
          </div>
        </div>
      </div>

      <!-- Avg Soil Moisture Card -->
      <div class="card stats-card">
        <div class="card-content">
          <div class="stats-info">
            <p class="stats-label">Avg Soil Moisture</p>
            <p class="stats-value">{{ summary.avgSoilMoisture }}%</p>
            <p class="stats-trend positive">{{ summary.totalReadings }} readings</p>
          </div>
          <div class="icon-container green">
            <i class="pi pi-ticket"></i>
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
      <!-- Temperature Trends Chart Card -->
      <div class="card chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Temperature Trends</h3>
          <p class="chart-subtitle">Average temperature across all plants</p>
        </div>
        <div class="chart-container line-chart">
          <svg class="line-svg" viewBox="0 0 350 180">
            <defs>
              <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#f97316;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#f97316;stop-opacity:0" />
              </linearGradient>
            </defs>
            <polygon :points="temperatureAreaPoints" fill="url(#tempGradient)" />
            <polyline
              :points="temperaturePoints"
              fill="none"
              stroke="#f97316"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle v-for="(point, i) in temperatureData" :key="i"
              :cx="i * 50 + 25"
              :cy="180 - (point.value / Math.max(...temperatureData.map(d => d.value), 1)) * 150"
              r="4"
              fill="#f97316"
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

      <!-- Humidity Trends Chart Card -->
      <div class="card chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Humidity Trends</h3>
          <p class="chart-subtitle">Average humidity across all plants</p>
        </div>
        <div class="chart-container line-chart">
          <svg class="line-svg" viewBox="0 0 350 180">
            <defs>
              <linearGradient id="humidityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
              </linearGradient>
            </defs>
            <polygon :points="humidityAreaPoints" fill="url(#humidityGradient)" />
            <polyline
              :points="humidityPoints"
              fill="none"
              stroke="#3b82f6"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle v-for="(point, i) in humidityData" :key="i"
              :cx="i * 50 + 25"
              :cy="180 - (point.value * 1.5)"
              r="4"
              fill="#3b82f6"
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

      <!-- Soil Moisture Card -->
      <div class="card chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Soil Moisture</h3>
          <p class="chart-subtitle">Average soil moisture level</p>
        </div>
        <div class="chart-container metric-display">
          <div class="metric-circle soil-metric">
            <div class="metric-value">{{ summary.avgSoilMoisture.toFixed(1) }}%</div>
            <div class="metric-label">Soil Moisture</div>
          </div>
          <div class="metric-info">
            <div class="info-item">
              <i class="pi pi-info-circle"></i>
              <span>{{ summary.totalReadings }} total readings</span>
            </div>
            <div class="info-item">
              <i class="pi pi-check-circle"></i>
              <span>Optimal: 40-60%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Light Level Card -->
      <div class="card chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Light Level</h3>
          <p class="chart-subtitle">Average light intensity</p>
        </div>
        <div class="chart-container metric-display">
          <div class="metric-circle light-metric">
            <div class="metric-value">{{ summary.avgLight.toFixed(0) }}</div>
            <div class="metric-label">Light Level</div>
          </div>
          <div class="metric-info">
            <div class="info-item">
              <i class="pi pi-sun"></i>
              <span>Average intensity</span>
            </div>
            <div class="info-item">
              <i class="pi pi-chart-bar"></i>
              <span>{{ summary.totalReadings }} readings</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Historical Data Card -->
    <div v-if="hasHistoricalData" class="card historical-card">
      <div class="chart-header">
        <div class="header-with-badge">
          <div>
            <h3 class="chart-title">Historical Analytics</h3>
            <p class="chart-subtitle">Average from last 5 sensor readings</p>
          </div>
          <div class="refresh-badge" @click="loadHistoricalData" :class="{ 'loading': loadingHistory }">
            <i class="pi pi-refresh"></i> Refresh
          </div>
        </div>
      </div>
      
      <div class="historical-grid">
        <!-- Temperature History -->
        <div class="historical-item temp-item">
          <div class="historical-icon temp">
            <i class="pi pi-sun"></i>
          </div>
          <div class="historical-content">
            <p class="historical-label">Temperature</p>
            <p class="historical-value">{{ historicalData.avgTemperature.toFixed(1) }}°C</p>
            <p class="historical-range">
              {{ historicalData.minTemperature.toFixed(1) }}°C - {{ historicalData.maxTemperature.toFixed(1) }}°C
            </p>
          </div>
        </div>

        <!-- Humidity History -->
        <div class="historical-item humidity-item">
          <div class="historical-icon humidity">
            <i class="pi pi-cloud"></i>
          </div>
          <div class="historical-content">
            <p class="historical-label">Humidity</p>
            <p class="historical-value">{{ historicalData.avgHumidity.toFixed(1) }}%</p>
            <p class="historical-range">Last {{ historicalData.count }} readings</p>
          </div>
        </div>

        <!-- Soil Moisture History -->
        <div class="historical-item soil-item">
          <div class="historical-icon soil">
            <i class="pi pi-ticket"></i>
          </div>
          <div class="historical-content">
            <p class="historical-label">Soil Moisture</p>
            <p class="historical-value">{{ historicalData.avgSoilMoisture.toFixed(1) }}%</p>
            <p class="historical-range">Average level</p>
          </div>
        </div>

        <!-- Light History -->
        <div class="historical-item light-item">
          <div class="historical-icon light">
            <i class="pi pi-bolt"></i>
          </div>
          <div class="historical-content">
            <p class="historical-label">Light Level</p>
            <p class="historical-value">{{ historicalData.avgLight.toFixed(0) }}</p>
            <p class="historical-range">Average intensity</p>
          </div>
        </div>
      </div>

      <!-- Period Info -->
      <div v-if="historicalData.period.start" class="period-info">
        <i class="pi pi-calendar"></i>
        <span>Period: {{ new Date(historicalData.period.start).toLocaleDateString() }} - {{ new Date(historicalData.period.end).toLocaleDateString() }}</span>
      </div>
    </div>

    <!-- No Historical Data State -->
    <div v-else-if="!loadingHistory" class="card empty-historical">
      <div class="empty-icon">
        <i class="pi pi-history"></i>
      </div>
      <h3>No Historical Data Available</h3>
      <p>Historical analytics will appear here once sensor data is collected.</p>
    </div>
    </template>
  </div>
</template>

<style scoped>
/* Container */
.analytics-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 1.5rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #6b7280;
  font-size: 1rem;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  gap: 1rem;
}

.error-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.error-state h3 {
  font-size: 1.25rem;
  color: #111827;
  margin: 0;
}

.error-state p {
  color: #6b7280;
  margin: 0;
  max-width: 400px;
}

.retry-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #22c55e;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #16a34a;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  gap: 1rem;
}

.empty-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: #dbeafe;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #111827;
  margin: 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
  max-width: 400px;
}

.empty-hint {
  font-size: 0.875rem;
  color: #9ca3af;
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

/* Metric Display */
.metric-display {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 1.5rem;
  gap: 2rem;
}

.metric-circle {
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.metric-circle.soil-metric {
  background: linear-gradient(135deg, #dcfce7 0%, #86efac 100%);
}

.metric-circle.light-metric {
  background: linear-gradient(135deg, #fef3c7 0%, #fde047 100%);
}

.metric-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #111827;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.metric-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.info-item i {
  color: #22c55e;
  font-size: 1.125rem;
}

.info-item span {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Historical Analytics */
.historical-card {
  margin-bottom: 1.5rem;
}

.header-with-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.refresh-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.refresh-badge:hover {
  background-color: #22c55e;
  color: white;
}

.refresh-badge.loading {
  pointer-events: none;
  opacity: 0.6;
}

.refresh-badge.loading i {
  animation: spin 1s linear infinite;
}

.historical-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.historical-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
}

.historical-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.historical-item.temp-item:hover {
  border-color: #f97316;
  background-color: #fff7ed;
}

.historical-item.humidity-item:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.historical-item.soil-item:hover {
  border-color: #16a34a;
  background-color: #f0fdf4;
}

.historical-item.light-item:hover {
  border-color: #eab308;
  background-color: #fefce8;
}

.historical-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.25rem;
}

.historical-icon.temp {
  background-color: #ffedd5;
  color: #ea580c;
}

.historical-icon.humidity {
  background-color: #dbeafe;
  color: #2563eb;
}

.historical-icon.soil {
  background-color: #dcfce7;
  color: #16a34a;
}

.historical-icon.light {
  background-color: #fef3c7;
  color: #ca8a04;
}

.historical-content {
  flex: 1;
}

.historical-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.historical-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
  line-height: 1;
}

.historical-range {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0.25rem 0 0 0;
}

.period-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.period-info i {
  color: #9ca3af;
}

.empty-historical {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
  text-align: center;
  gap: 1rem;
}

.empty-historical .empty-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: #f3f4f6;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.empty-historical h3 {
  font-size: 1.125rem;
  color: #111827;
  margin: 0;
}

.empty-historical p {
  color: #6b7280;
  margin: 0;
  max-width: 400px;
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
