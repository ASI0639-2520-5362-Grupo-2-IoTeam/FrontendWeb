import { defineStore } from 'pinia';
import type { Plant } from '../domain/model/plants.entity';

interface PlantManagementState {
  plants: Plant[];
  loading: boolean;
  error: string | null;
}

export const usePlantManagementStore = defineStore('plantManagement', {
  state: (): PlantManagementState => ({
    plants: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchPlants() {
      this.loading = true;
      this.error = null;
      try {

        const data: Plant[] = [];
        this.plants = data;
      } catch (e: any) {
        this.error = e.message || 'Error al cargar las plantas';
      } finally {
        this.loading = false;
      }
    },
    addPlant(plant: Plant) {
      this.plants.push(plant);
    },
    updatePlant(updated: Plant) {
      const idx = this.plants.findIndex(p => p.id === updated.id);
      if (idx !== -1) this.plants[idx] = updated;
    },
    removePlant(id: number) {
      this.plants = this.plants.filter(p => p.id !== id);
    },
    setError(message: string) {
      this.error = message;
    }
  }
});

