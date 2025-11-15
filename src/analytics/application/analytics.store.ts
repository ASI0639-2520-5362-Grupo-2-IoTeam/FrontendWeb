import { defineStore } from 'pinia';
import type { Analytics, SensorData } from '../domain/model/analytics.entity';
import { AnalyticsService } from '../infrastructure/analytics.service';
import type { AxiosError } from 'axios';

interface HistoricalAverages {
  avgTemperature: number;
  avgHumidity: number;
  avgSoilMoisture: number;
  avgLight: number;
  count: number;
  period: {
    start: string | null;
    end: string | null;
  };
  history: SensorData[];
}

interface AnalyticsState {
  analytics: Analytics[];
  sensorData: SensorData[];
  historicalAverages: HistoricalAverages | null;
  loading: boolean;
  error: string | null;
}

export const useAnalyticsStore = defineStore('analytics', {
  state: (): AnalyticsState => ({
    analytics: [],
    sensorData: [],
    historicalAverages: null,
    loading: false,
    error: null,
  }),
  
  getters: {
    hasAnalytics: (state) => state.analytics.length > 0,
    hasSensorData: (state) => state.sensorData.length > 0,
    hasHistoricalData: (state) => state.historicalAverages !== null && state.historicalAverages.count > 0,
    
    getAnalyticsByPlantId: (state) => (plantId: number) => {
      return state.analytics.find(a => a.plantId === plantId);
    },
    
    getAnalyticsByDeviceId: (state) => (deviceId: string) => {
      return state.analytics.find(a => a.deviceId === deviceId);
    },
    
    latestSensorData: (state) => {
      if (state.sensorData.length === 0) return null;
      return state.sensorData.reduce((latest, current) => 
        new Date(current.created_at) > new Date(latest.created_at) ? current : latest
      );
    }
  },
  
  actions: {
    async fetchAllSensorData() {
      this.loading = true;
      this.error = null;
      
      try {
        const analyticsService = new AnalyticsService();
        const response = await analyticsService.getAllSensorData();
        this.sensorData = response.data;
        
        console.log('[AnalyticsStore] Loaded sensor data:', this.sensorData.length);
      } catch (e: any) {
        const axiosError = e as AxiosError;
        
        if (axiosError.response?.status === 404) {
          this.sensorData = [];
          this.error = null;
          console.log('[AnalyticsStore] No sensor data found');
        } else {
          this.error = e.message || 'Error loading sensor data';
          console.error('[AnalyticsStore] Error:', e);
        }
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSensorDataByDevice(deviceId: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const analyticsService = new AnalyticsService();
        const response = await analyticsService.getSensorDataByDevice(deviceId);
        this.sensorData = response.data;
        
        console.log('[AnalyticsStore] Loaded sensor data for device:', deviceId);
      } catch (e: any) {
        this.error = e.message || 'Error loading device sensor data';
        console.error('[AnalyticsStore] Error:', e);
      } finally {
        this.loading = false;
      }
    },
    
    async importSensorData(data: Omit<SensorData, 'id'>[]) {
      this.loading = true;
      this.error = null;
      
      try {
        const analyticsService = new AnalyticsService();
        await analyticsService.importSensorData(data);
        
        console.log('[AnalyticsStore] Imported sensor data successfully');
        
        // Refresh data after import
        await this.fetchAllSensorData();
      } catch (e: any) {
        this.error = e.message || 'Error importing sensor data';
        console.error('[AnalyticsStore] Error:', e);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchHistoricalAverages(limit: number = 5) {
      this.loading = true;
      this.error = null;
      
      try {
        const analyticsService = new AnalyticsService();
        const response = await analyticsService.getRecentAverages(limit);
        this.historicalAverages = response.data;
        
        console.log('[AnalyticsStore] Loaded historical averages:', this.historicalAverages);
      } catch (e: any) {
        const axiosError = e as AxiosError;
        
        if (axiosError.response?.status === 404) {
          this.historicalAverages = null;
          this.error = null;
          console.log('[AnalyticsStore] No historical data found');
        } else {
          this.error = e.message || 'Error loading historical averages';
          console.error('[AnalyticsStore] Error:', e);
        }
      } finally {
        this.loading = false;
      }
    },
    
    addAnalytics(analytic: Analytics) {
      const existingIndex = this.analytics.findIndex(a => a.plantId === analytic.plantId);
      if (existingIndex !== -1) {
        this.analytics[existingIndex] = analytic;
      } else {
        this.analytics.push(analytic);
      }
    },
    
    setError(message: string) {
      this.error = message;
    },
    
    clearError() {
      this.error = null;
    },
    
    reset() {
      this.analytics = [];
      this.sensorData = [];
      this.historicalAverages = null;
      this.loading = false;
      this.error = null;
    }
  }
});
