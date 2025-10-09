import { defineStore } from 'pinia';
import type { Analytics } from '../domain/model/analytics.entity';

interface AnalyticsState {
  analytics: Analytics[];
  loading: boolean;
  error: string | null;
}

export const useAnalyticsStore = defineStore('analytics', {
  state: (): AnalyticsState => ({
    analytics: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAnalytics() {
      this.loading = true;
      this.error = null;
      try {
        // Aquí deberías llamar a tu servicio real para obtener los análisis
        // Por ejemplo: const data = await analyticsService.getAll();
        const data: Analytics[] = [];
        this.analytics = data;
      } catch (e: any) {
        this.error = e.message || 'Error al cargar los análisis';
      } finally {
        this.loading = false;
      }
    },
    addAnalytics(analytic: Analytics) {
      this.analytics.push(analytic);
    },
    updateAnalytics(updated: Analytics) {
      const idx = this.analytics.findIndex(a => a.id === updated.id);
      if (idx !== -1) this.analytics[idx] = updated;
    },
    removeAnalytics(id: number) {
      this.analytics = this.analytics.filter(a => a.id !== id);
    },
    setError(message: string) {
      this.error = message;
    }
  }
});

