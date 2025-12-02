<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthenticationStore } from '../../iam/services/Authentication.Store.ts';
import { useProfileStore } from '../application/profile.store';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Avatar from 'primevue/avatar';

interface Stats {
  label: string;
  value: string | number;
  icon: string;
}

const authStore = useAuthenticationStore();
const profileStore = useProfileStore();

const isEditing = ref(false);
const formData = ref({
  fullName: '',
  phone: '',
  bio: '',
  location: ''
});

const avatarFile = ref<File | null>(null);

// Computed properties for display
const fullName = computed(() => {
  const p = profileStore.profile;
  if (!p) return 'Usuario';
  return p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name || p.username || 'Usuario';
});
const email = computed(() => profileStore.profile?.email || authStore.email || '');
const phone = computed(() => profileStore.profile?.phone || '');
const bio = computed(() => profileStore.profile?.bio || '');
const location = computed(() => profileStore.profile?.location || '');
const joinDate = computed(() => {
  if (profileStore.profile?.joinDate) {
    return new Date(profileStore.profile.joinDate).toLocaleDateString('es-PE');
  }
  return '';
});

const avatarPreview = computed(() => profileStore.profile?.avatarUrl || null);

const stats = computed<Stats[]>(() => {
  if (!profileStore.profile?.stats) {
    return [
      { icon: '🌱', value: 0, label: 'Total plants' },
      { icon: '💧', value: 0, label: 'Watering Sessions' },
      { icon: '📅', value: '', label: 'Member Since' },
      { icon: '✅', value: '0%', label: 'Success Rate' },
    ];
  }
  return [
    { icon: '🌱', value: profileStore.profile.stats.totalPlants || 0, label: 'Total plants' },
    { icon: '💧', value: profileStore.profile.stats.wateringSessions || 0, label: 'Watering Sessions' },
    { icon: '📅', value: joinDate.value, label: 'Member Since' },
    { icon: '✅', value: `${profileStore.profile.stats.successRate ?? 0}%`, label: 'Success Rate' },
  ];
});

const recentAchievements = computed(() => {
  return profileStore.achievements.map(a => ({
    icon: a.icon || '🏆',
    title: a.title,
    description: a.description,
    date: a.earnedDate ? new Date(a.earnedDate).toLocaleDateString('es-PE') : '—',
    status: a.status
  }));
});

// Watch for auth state changes and load profile
watch(
  () => authStore.isSignedIn,
  (isReady) => {
    console.log('[Profile.vue] Auth state changed, isSignedIn:', isReady);
    if (isReady) {
      console.log('[Profile.vue] Calling fetchProfile() and fetchAchievements()');
      profileStore.fetchProfile();
      profileStore.fetchAchievements();
    } else {
      profileStore.$reset();
    }
  },
  { immediate: false } // NO immediate porque lo hacemos en onMounted
);

onMounted(async () => {
  console.log('[Profile.vue] onMounted - initializing auth store');
  if (!authStore.isInitialized) {
    authStore.initialize();
  }
  
  // Ahora cargar el perfil directamente si está autenticado
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (authStore.isSignedIn) {
    console.log('[Profile.vue] User is signed in, fetching profile');
    profileStore.fetchProfile();
    profileStore.fetchAchievements();
  } else {
    console.log('[Profile.vue] User is NOT signed in');
  }
});

// Debug computed
const debugInfo = computed(() => ({
  authStoreIsSignedIn: authStore.isSignedIn,
  authStoreToken: authStore.token ? '***exists***' : 'null',
  profileStoreProfile: profileStore.profile,
  profileStoreLoading: profileStore.loading,
  profileStoreError: profileStore.error,
  localStorageToken: localStorage.getItem('token') ? '***exists***' : 'null'
}));

const handleEdit = () => {
  // Initialize form with current data
  formData.value = {
    fullName: profileStore.profile?.fullName || '',
    phone: profileStore.profile?.phone || '',
    bio: profileStore.profile?.bio || '',
    location: profileStore.profile?.location || ''
  };
  isEditing.value = true;
};

const handleSave = async () => {
  try {
    await profileStore.updateProfile(formData.value);
    isEditing.value = false;
  } catch (error) {
    console.error('Error al guardar perfil:', error);
  }
};

const handleCancel = () => {
  isEditing.value = false;
};

const handleChangeAvatar = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/png';
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      avatarFile.value = file;
      try {
        await profileStore.uploadAvatar(file);
      } catch (error) {
        console.error('Error al cargar avatar:', error);
      }
    }
  };
  input.click();
};
</script>

<template>
  <div class="profile">
    <!-- DEBUG INFO -->
    <div style="background: #f0f0f0; padding: 10px; margin: 10px; border: 1px solid red; font-size: 12px; display: none;">
      <pre>{{ JSON.stringify(debugInfo, null, 2) }}</pre>
    </div>
    
    <div class="content">
      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <Avatar
                :image="avatarPreview || undefined"
                :label="!avatarPreview ? fullName.split(' ').map(n => n[0]).join('') : undefined"
                class="profile-avatar"
                shape="circle"
                size="xlarge"
            />
            <Button
                label="Change Photo"
                text
                class="change-photo-btn"
                @click="handleChangeAvatar"
            />
          </div>
          <div class="header-info">
            <h1 class="profile-name">{{ fullName }}</h1>
            <p class="profile-meta">{{ location }} • Joined {{ joinDate }}</p>
            <p class="profile-bio">{{ bio }}</p>
          </div>
          <div class="header-actions">
            <Button
                v-if="!isEditing"
                label="Edit Profile"
                icon="pi pi-pencil"
                @click="handleEdit"
            />
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div
              v-for="(stat, index) in stats"
              :key="index"
              class="stat-card"
          >
            <div class="stat-icon">{{ stat.icon }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Profile Details -->
      <div class="details-section">
        <!-- Personal Information -->
        <div class="info-card">
          <div class="card-header">
            <h2 class="card-title">Personal Information</h2>
          </div>
          <div class="card-content">
            <div v-if="isEditing" class="form-container">
              <div class="form-group">
                <label class="label">Full Name</label>
                <InputText v-model="formData.fullName" class="input" />
              </div>
              <div class="form-group">
                <label class="label">Email Address</label>
                <InputText v-model="email" type="email" class="input" disabled />
              </div>
              <div class="form-group">
                <label class="label">Phone Number</label>
                <InputText v-model="formData.phone" type="tel" class="input" />
              </div>
              <div class="form-group">
                <label class="label">Location</label>
                <InputText v-model="formData.location" class="input" />
              </div>
              <div class="form-group">
                <label class="label">Bio</label>
                <Textarea
                    v-model="formData.bio"
                    rows="4"
                    class="input"
                />
              </div>
              <div class="form-actions">
                <Button
                    label="Save Changes"
                    class="btn-primary"
                    @click="handleSave"
                    :loading="profileStore.loading"
                />
                <Button
                    label="Cancel"
                    outlined
                    @click="handleCancel"
                />
              </div>
            </div>
            <div v-else class="info-grid">
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ phone || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Location</span>
                <span class="info-value">{{ location || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Member Since</span>
                <span class="info-value">{{ joinDate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Achievements -->
        <div class="achievements-card">
          <div class="card-header">
            <h2 class="card-title">Recent Achievements</h2>
          </div>
          <div class="card-content">
            <div v-if="recentAchievements.length > 0" class="achievements-list">
              <div
                  v-for="(achievement, index) in recentAchievements"
                  :key="index"
                  class="achievement-item"
                  :class="{ 'locked': achievement.status === 'locked' }"
              >
                <div class="achievement-icon">{{ achievement.icon }}</div>
                <div class="achievement-content">
                  <h4 class="achievement-title">{{ achievement.title }}</h4>
                  <p class="achievement-description">{{ achievement.description }}</p>
                </div>
                <span class="achievement-date">{{ achievement.date }}</span>
              </div>
            </div>
            <div v-else class="empty-achievements">
              <p>No achievements yet. Keep watering your plants! 🌱</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile {
  max-width: 1200px;
  margin: 0 auto;
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* Profile Card */
.profile-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.profile-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--spacing-xl);
  align-items: start;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.profile-avatar {
  width: 120px !important;
  height: 120px !important;
  font-size: 48px !important;
  background: var(--primary-green) !important;
  color: #ffffff !important;
}

.change-photo-btn {
  font-size: var(--font-size-xs);
  color: var(--primary-green) !important;
}

.header-info {
  flex: 1;
}

.profile-name {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.profile-meta {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
}

.profile-bio {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.stat-card {
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  text-align: center;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--primary-green);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-sm);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Details Section */
.details-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}

.info-card,
.achievements-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.card-header {
  margin-bottom: var(--spacing-lg);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

/* Info Grid */
.info-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-semibold);
}

.info-value {
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

/* Form Styles */
.form-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.input {
  width: 100%;
}

.input :deep(.p-inputtext),
.input :deep(.p-inputtextarea) {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background: var(--bg-primary);
}

.input :deep(.p-inputtext:focus),
.input :deep(.p-inputtextarea:focus) {
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(138, 199, 61, 0.1);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.btn-primary {
  background: var(--primary-green) !important;
  border: none !important;
  color: #ffffff !important;
}

.btn-primary:hover {
  background: #7ab531 !important;
}

/* Achievements */
.achievements-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.achievement-item:hover {
  border-color: var(--primary-green);
  box-shadow: var(--shadow-sm);
}

.achievement-icon {
  width: 48px;
  height: 48px;
  background: rgba(138, 199, 61, 0.15);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.achievement-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.achievement-date {
  font-size: var(--font-size-xs);
  color: var(--text-light);
  white-space: nowrap;
}

.empty-achievements {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: var(--text-secondary);
  text-align: center;
}

.empty-achievements p {
  margin: 0;
  font-size: var(--font-size-base);
}

@media (max-width: 992px) {
  .details-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-header {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .avatar-section {
    justify-self: center;
  }

  .header-actions {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>