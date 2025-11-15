import { ref, onMounted, computed } from 'vue';
import { useAuthenticationStore } from '../../../iam/services/Authentication.Store';
import { AnalyticsService } from '../../../analytics/infrastructure/analytics.service';
import { PlantsService } from '../../../plants/infrastructure/plats.services';
import type { Plant } from '../../../plants/domain/model/plants.entity';

// Interfaces for dashboard data
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

interface NextWatering {
  plantName: string;
  timeDue: string;
  location: string;
}

export function useDashboard() {
  // Services and stores
  const authStore = useAuthenticationStore();
  const analyticsService = new AnalyticsService();
  const plantsService = new PlantsService();

  // Reactive state
  const loading = ref(true);
  const error = ref<string | null>(null);
  const plants = ref<Plant[]>([]);

  const analytics = computed(() =>
    plants.value
      .filter(plant => plant.metrics?.length)
      .map(plant => analyticsService.calculateAnalyticsFromMetrics(plant.id, plant.metrics, plant.metrics[0]?.deviceId))
  );

  // Computed properties for dashboard stats
  const stats = computed<Stat[]>(() => {
    const totalPlants = plants.value.length;
    const activeAlerts = plants.value.filter(p => p.status === 'warning' || p.status === 'critical').length;
    const avgHumidity = analytics.value.length
      ? Math.round(analytics.value.reduce((sum, a) => sum + a.summary.avgHumidity, 0) / analytics.value.length)
      : 0;
    const healthyPlants = plants.value.filter(p => p.status === 'healthy').length;
    const healthScore = totalPlants ? Math.round((healthyPlants / totalPlants) * 100) : 0;

    return [
      { icon: '🌱', value: `${totalPlants}`, label: 'Total plants', trend: '', trendUp: true },
      { icon: '⚠️', value: `${activeAlerts}`, label: 'Active Alerts', trend: '', trendUp: false },
      { icon: '💧', value: `${avgHumidity}%`, label: 'Avg Humidity', trend: '', trendUp: true },
      { icon: '✅', value: `${healthScore}%`, label: 'Health Score', trend: 'Excellent', trendUp: true },
    ];
  });

  const recentActivities = computed<Activity[]>(() =>
    plants.value.slice(0, 4).map(plant => ({
      icon: '💧',
      title: `Watered ${plant.name}`,
      description: 'Completed watering task',
      time: new Date(plant.lastWatered).toLocaleDateString(),
    }))
  );

  const nextWateringPlant = computed<NextWatering | null>(() => {
    if (!plants.value.length) return null;
    const sortedPlants = [...plants.value].sort((a, b) => new Date(a.lastWatered).getTime() - new Date(b.lastWatered).getTime());
    const nextPlant = sortedPlants[0]!;
    return {
      plantName: `🌿 ${nextPlant.name}`,
      timeDue: 'Due in 2 hours',
      location: 'Living Room',
    };
  });

  // Fetch data
  const fetchDashboardData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const userId = authStore.uuid;
      if (!userId) {
        error.value = 'User not authenticated.';
        return;
      }
      const response = await plantsService.getPlantsByUser(userId);
      plants.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to load dashboard data.';
    } finally {
      loading.value = false;
    }
  };

  // Lifecycle hook
  onMounted(() => {
    if (authStore.isInitialized) {
      fetchDashboardData();
    } else {
      // Wait for auth to be initialized
      const unwatch = authStore.$onAction(({ name, after }) => {
        if (name === 'initialize') {
          after(() => {
            fetchDashboardData();
            unwatch();
          });
        }
      });
    }
  });

  // Return state and methods
  return {
    loading,
    error,
    stats,
    recentActivities,
    nextWateringPlant,
    handleWaterNow: () => console.log('Watering plant...'),
    handleViewAll: () => console.log('View all activities...'),
  };
}
