<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputSwitch from 'primevue/inputswitch';


interface Device {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'inactive';
}

const fullName = ref('John Doe');
const email = ref('john@plantcare.com');
const phone = ref('+1 (555) 123-4567');

const wateringReminders = ref(true);
const humidityAlerts = ref(true);
const weeklyReports = ref(false);

const devices = ref<Device[]>([
  { id: 1, name: 'Humidity Sensor #1', location: 'Living Room', status: 'active' },
  { id: 2, name: 'Humidity Sensor #2', location: 'Bedroom', status: 'active' },
]);

const handleSaveProfile = () => {
  console.log('Saving profile:', { fullName: fullName.value, email: email.value, phone: phone.value });
};

const handleManageSubscription = () => {
  console.log('Manage subscription');
};

const handleAddDevice = () => {
  console.log('Add new device');
};
</script>

<template>
  <div class="settings">
    <h1 class="title">Settings</h1>

    <!-- Profile Settings -->
    <div class="section">
      <h2 class="section-title">Profile Settings</h2>
      <div class="card">
        <div class="form-group">
          <label class="label">Full Name</label>
          <InputText
              v-model="fullName"
              class="input"
          />
        </div>
        <div class="form-group">
          <label class="label">Email Address</label>
          <InputText
              v-model="email"
              type="email"
              class="input"
          />
        </div>
        <div class="form-group">
          <label class="label">Phone Number</label>
          <InputText
              v-model="phone"
              type="tel"
              class="input"
          />
        </div>
        <Button
            label="Save Changes"
            class="btn-primary"
            @click="handleSaveProfile"
        />
      </div>
    </div>

    <!-- Subscription Plan -->
    <div class="section">
      <h2 class="section-title">Subscription Plan</h2>
      <div class="card">
        <div class="plan-header">
          <div>
            <h3 class="plan-name">Pro Plan</h3>
            <p class="plan-description">Unlimited plants and advanced monitoring</p>
          </div>
          <div class="plan-price">
            $9.99<span>/month</span>
          </div>
        </div>
        <div class="plan-features">
          <div class="feature">✅ Unlimited plants</div>
          <div class="feature">✅ Advanced humidity tracking</div>
          <div class="feature">✅ Custom watering schedules</div>
          <div class="feature">✅ Priority support</div>
        </div>
        <Button
            label="Manage Subscription"
            outlined
            @click="handleManageSubscription"
        />
      </div>
    </div>

    <!-- Device Management -->
    <div class="section">
      <h2 class="section-title">Device Management</h2>
      <div class="card">
        <div class="device-list">
          <div
              v-for="device in devices"
              :key="device.id"
              class="device-item"
          >
            <div class="device-icon">📱</div>
            <div class="device-info">
              <h4 class="device-name">{{ device.name }}</h4>
              <p class="device-status">Connected • {{ device.location }}</p>
            </div>
            <span class="status-badge healthy">
              <span class="status-dot"></span>
              Active
            </span>
          </div>
        </div>
        <Button
            label="+ Add New Device"
            class="btn-secondary"
            @click="handleAddDevice"
        />
      </div>
    </div>

    <!-- Notifications -->
    <div class="section">
      <h2 class="section-title">Notifications</h2>
      <div class="card">
        <div class="toggle-item">
          <div>
            <h4 class="toggle-title">Watering Reminders</h4>
            <p class="toggle-description">Get notified when it's time to water</p>
          </div>
          <InputSwitch v-model="wateringReminders" />
        </div>
        <div class="toggle-item">
          <div>
            <h4 class="toggle-title">Low Humidity Alerts</h4>
            <p class="toggle-description">Receive alerts for low humidity levels</p>
          </div>
          <InputSwitch v-model="humidityAlerts" />
        </div>
        <div class="toggle-item">
          <div>
            <h4 class="toggle-title">Weekly Reports</h4>
            <p class="toggle-description">Get weekly plant health summaries</p>
          </div>
          <InputSwitch v-model="weeklyReports" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings {
  max-width: 900px;
  margin: 0 auto;
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xl) 0;
}

.section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

/* Form Styles */
.form-group {
  margin-bottom: var(--spacing-lg);
}

.label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.input {
  width: 100%;
}

.input :deep(.p-inputtext) {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: all 0.2s ease;
}

.input :deep(.p-inputtext:focus) {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(138, 199, 61, 0.1);
}

.btn-primary {
  background: var(--primary-green) !important;
  border: none !important;
  color: #ffffff !important;
  padding: 12px 24px;
  font-weight: var(--font-weight-semibold);
}

.btn-primary:hover {
  background: #7ab531 !important;
}

/* Plan Styles */
.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.plan-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.plan-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.plan-price {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-green);
}

.plan-price span {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-regular);
  color: var(--text-light);
}

.plan-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.feature {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

/* Device Styles */
.device-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.device-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.device-icon {
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

.device-info {
  flex: 1;
}

.device-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.device-status {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  background: rgba(138, 199, 61, 0.15);
}

.status-badge.healthy {
  color: var(--status-healthy);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.btn-secondary {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.btn-secondary:hover {
  border-color: var(--primary-green) !important;
}

/* Toggle Styles */
.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.toggle-item:last-child {
  border-bottom: none;
}

.toggle-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.toggle-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* Override PrimeVue InputSwitch styles */
:deep(.p-inputswitch.p-inputswitch-checked .p-inputswitch-slider) {
  background: var(--primary-green) !important;
}

:deep(.p-inputswitch .p-inputswitch-slider) {
  background: var(--border-color);
}

@media (max-width: 768px) {
  .plan-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .plan-features {
    grid-template-columns: 1fr;
  }

  .device-item {
    flex-wrap: wrap;
  }

  .toggle-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
}
</style>