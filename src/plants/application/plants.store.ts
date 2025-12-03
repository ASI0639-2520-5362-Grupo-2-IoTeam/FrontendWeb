import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Plant } from '../domain/model/plants.entity';
import { PlantsService } from '../infrastructure/plants.services';

export const usePlantManagementStore = defineStore('plantManagement', () => {
  const plants = ref<Plant[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchPlants = async (userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const plantService = new PlantsService();
      const response = await plantService.getPlantsByUser(userId);
      plants.value = response.data;
    } catch (e: any) {
      error.value = e.message || 'Error al cargar las plantas';
    } finally {
      loading.value = false;
    }
  };

  const addPlant = (plant: Plant) => {
    plants.value.push(plant);
  };

  const updatePlant = (updated: Plant) => {
    const idx = plants.value.findIndex(p => p.id === updated.id);
    if (idx !== -1) plants.value[idx] = updated;
  };

  const removePlant = (id: number) => {
    plants.value = plants.value.filter(p => p.id !== id);
  };

  const setError = (message: string) => {
    error.value = message;
  };

  return {
    plants,
    loading,
    error,
    fetchPlants,
    addPlant,
    updatePlant,
    removePlant,
    setError,
    $reset: () => {
      plants.value = [];
      loading.value = false;
      error.value = null;
    }
  };
});
