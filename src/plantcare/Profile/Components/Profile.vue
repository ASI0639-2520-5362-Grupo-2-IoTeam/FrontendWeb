<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Avatar from 'primevue/avatar';

interface Stats {
  label: string;
  value: string | number;
  icon: string;
}

const fullName = ref('John Doe');
const email = ref('john@plantcare.com');
const phone = ref('+1 (555) 123-4567');
const bio = ref('Plant enthusiast and urban gardener. Love taking care of tropical plants and sharing tips with the community.');
const location = ref('San Francisco, CA');
const joinDate = ref('January 2024');

const stats = ref<Stats[]>([
  { icon: '🌱', value: 24, label: 'Total Plants' },
  { icon: '💧', value: 156, label: 'Watering Sessions' },
  { icon: '📅', value: '8 months', label: 'Member Since' },
  { icon: '✅', value: '95%', label: 'Success Rate' },
]);

const recentAchievements = ref([
  { icon: '🏆', title: 'Plant Master', description: 'Reached 20+ plants', date: '2 weeks ago' },
  { icon: '💧', title: 'Hydration Hero', description: '100 watering sessions', date: '1 month ago' },
  { icon: '📊', title: 'Data Tracker', description: 'Logged 30 days consecutively', date: '2 months ago' },
]);

const isEditing = ref(false);

const handleEdit = () => {
  isEditing.value = true;
};

const handleSave = () => {
  isEditing.value = false;
  console.log('Profile saved:', {
    fullName: fullName.value,
    email: email.value,
    phone: phone.value,
    bio: bio.value,
    location: location.value,
  });
};

const handleCancel = () => {
  isEditing.value = false;
};

const handleChangeAvatar = () => {
  console.log('Change avatar');
};
</script>

<template>
  <div class="profile">
    <div class="content">
      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <Avatar
                label="JD"
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
                <InputText v-model="fullName" class="input" />
              </div>
              <div class="form-group">
                <label class="label">Email Address</label>
                <InputText v-model="email" type="email" class="input" />
              </div>
              <div class="form-group">
                <label class="label">Phone Number</label>
                <InputText v-model="phone" type="tel" class="input" />
              </div>
              <div class="form-group">
                <label class="label">Location</label>
                <InputText v-model="location" class="input" />
              </div>
              <div class="form-group">
                <label class="label">Bio</label>
                <Textarea
                    v-model="bio"
                    rows="4"
                    class="input"
                />
              </div>
              <div class="form-actions">
                <Button
                    label="Save Changes"
                    class="btn-primary"
                    @click="handleSave"
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
                <span class="info-value">{{ phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Location</span>
                <span class="info-value">{{ location }}</span>
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
            <div class="achievements-list">
              <div
                  v-for="(achievement, index) in recentAchievements"
                  :key="index"
                  class="achievement-item"
              >
                <div class="achievement-icon">{{ achievement.icon }}</div>
                <div class="achievement-content">
                  <h4 class="achievement-title">{{ achievement.title }}</h4>
                  <p class="achievement-description">{{ achievement.description }}</p>
                </div>
                <span class="achievement-date">{{ achievement.date }}</span>
              </div>
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