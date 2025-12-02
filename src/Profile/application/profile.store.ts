import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserProfile, UserStats, UserAchievement, AchievementsResponse } from '../model/profile.entity';
import { profileService } from '../infrastructure/profile.service';

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<UserProfile | null>(null);
  const achievements = ref<UserAchievement[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchProfile = async () => {
    loading.value = true;
    error.value = null;
    try {
      const userProfile = await profileService.getProfile();
      console.log('[ProfileStore] Profile loaded:', userProfile);
      profile.value = userProfile;
    } catch (e: any) {
      console.error('[ProfileStore] Error loading profile:', e);
      error.value = e.message || 'Error al cargar el perfil';
      profile.value = null;
    } finally {
      loading.value = false;
    }
  };

  const fetchAchievements = async () => {
    try {
      const response: AchievementsResponse = await profileService.getAchievements();
      achievements.value = response.achievements || [];
    } catch (e: any) {
      console.warn('Error al cargar logros:', e.message);
      achievements.value = [];
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const updated = await profileService.updateProfile(data);
      profile.value = updated;
      return updated;
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar el perfil';
      throw e;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const response = await profileService.uploadAvatar(file);
      if (profile.value) {
        profile.value.avatarUrl = response.avatarUrl;
      }
      return response;
    } catch (e: any) {
      error.value = e.message || 'Error al cargar el avatar';
      throw e;
    }
  };

  const setError = (message: string) => {
    error.value = message;
  };

  return {
    profile,
    achievements,
    loading,
    error,
    fetchProfile,
    fetchAchievements,
    updateProfile,
    uploadAvatar,
    setError,
    $reset: () => {
      profile.value = null;
      achievements.value = [];
      loading.value = false;
      error.value = null;
    }
  };
});
