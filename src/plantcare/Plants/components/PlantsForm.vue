<template>
  <div class="plant-form-card">
    <h2 class="form-title">Add a Plant</h2>

    <form @submit.prevent="onSubmit" class="form-grid">
      <div class="field">
        <label for="name">Name</label>
        <InputText id="name" v-model="form.name" placeholder="e.g. Monstera Deliciosa" />
        <small v-if="errors.name" class="error">{{ errors.name }}</small>
      </div>

      <div class="field">
        <label for="type">Type</label>
        <InputText id="type" v-model="form.type" placeholder="e.g. Tropical, Succulent" />
        <small v-if="errors.type" class="error">{{ errors.type }}</small>
      </div>

      <div class="field">
        <label for="imgUrl">Image URL</label>
        <InputText id="imgUrl" v-model="form.imgUrl" placeholder="https://..." />
        <small class="hint">You can paste an image URL from the web.</small>
      </div>

      <div class="field">
        <label for="location">Location</label>
        <InputText id="location" v-model="form.location" placeholder="e.g. Living Room" />
      </div>

      <div class="field">
        <label for="humidity">Humidity (%)</label>
        <InputNumber id="humidity" v-model="form.humidity" :min="0" :max="100" />
      </div>

      <div class="field">
        <label for="lastWatered">Last Watered</label>
        <InputText id="lastWatered" v-model="form.lastWatered" placeholder="e.g. Today, 2 days ago" />
      </div>

      <div class="field">
        <label for="nextWatering">Next Watering</label>
        <InputText id="nextWatering" v-model="form.nextWatering" placeholder="e.g. In 3 days" />
      </div>

      <div class="field">
        <label for="status">Status</label>
        <Dropdown id="status"
          v-model="form.status"
          :options="statusOptions"
          optionValue="value"
          placeholder="Select status"
        >
          <template #option="{ option }">
            <div :class="['dropdown-status-option', option.value]">
              <span class="status-dot-preview"></span>
              <span>{{ option.label }}</span>
            </div>
          </template>
        </Dropdown>
      </div>

      <div class="field full">
        <label for="bio">Bio</label>
        <Textarea id="bio" v-model="form.bio" rows="4" placeholder="Describe your plant..." />
      </div>

      <div class="actions">
        <Button type="button" class="btn-ghost" @click="onReset">Reset</Button>
        <Button type="submit" class="btn-primary">Save Plant</Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthenticationStore } from '../../../IAM/services/Authentication.Store.ts';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import { PlantsService} from "../services/plats.services.ts";
import type { Plant } from '../model/plants.entity';

const router = useRouter();
const plantsService = new PlantsService();

const authStore = useAuthenticationStore();
if (!authStore.isSignedIn) {
  try { authStore.initialize(); } catch (e) { /* ignore */ }
}

const userId = () => authStore.id as number | null;

const statusOptions = [
  { label: 'Healthy', value: 'healthy' },
  { label: 'Warning', value: 'warning' },
  { label: 'Critical', value: 'critical' }
];

const emptyState = (): Partial<Plant> => ({
  name: '',
  type: '',
  imgUrl: '',
  humidity: 50,
  lastWatered: '',
  nextWatering: '',
  status: 'healthy',
  bio: '',
  location: ''
});

const form = reactive<Partial<Plant>>({ ...emptyState() });
const errors = reactive<Record<string, string>>({});

const validate = () => {
  errors.name = form.name && form.name.trim() ? '' : 'Name is required';
  errors.type = form.type && form.type.trim() ? '' : 'Type is required';
  // humidity optional but keep between 0-100
  if (form.humidity == null || isNaN(form.humidity)) {
    errors.humidity = '';
  } else if (form.humidity < 0 || form.humidity > 100) {
    errors.humidity = 'Humidity must be between 0 and 100';
  } else {
    errors.humidity = '';
  }

  return !Object.values(errors).some(v => v);
};

const onSubmit = async () => {
  if (!validate()) return;

  // Build payload matching the Plant interface; id will be assigned by the backend (json-server)
  if (userId() == null) {
    // If somehow not authenticated, redirect to sign-in
    return router.push({ name: 'SignIn' });
  }

  const payload: Omit<Plant, 'id'> = {
    userId: userId() ?? 0, // Si userId es null, asigna 0 (o puedes mostrar un error)
    name: String(form.name || '').trim(),
    type: String(form.type || '').trim(),
    imgUrl: String(form.imgUrl || '').trim() || 'https://via.placeholder.com/180',
    humidity: Number(form.humidity || 0),
    lastWatered: String(form.lastWatered || '').trim() || 'Unknown',
    nextWatering: String(form.nextWatering || '').trim() || 'Unknown',
    status: (form.status as Plant['status']) || 'healthy',
    bio: String(form.bio || '').trim(),
    location: String(form.location || '').trim() || 'Unknown'
  };

  try {
    await plantsService.createPlant(payload);
    // after success, navigate back to plants list or refresh
    router.push('/plants');
  } catch (err) {
    console.error('Error creating plant:', err);
    // you can show a toast here if you have one registered
  }
};

const onReset = () => {
  Object.assign(form, emptyState());
};
</script>

<style scoped>
.plant-form-card {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  text-align: center;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
}

.field {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.field.full {
  width: 100%;
}

.field label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.hint {
  font-size: var(--font-size-xs);
  color: var(--text-light);
}

.error {
  color: var(--status-critical);
  font-size: 12px;
  margin-top: 6px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.btn-primary {
  background: var(--primary-green) !important;
  color: #fff !important;
  border: none !important;
  padding: 10px 18px;
  border-radius: var(--radius-md);
}

.btn-ghost {
  background: transparent !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-secondary) !important;
  padding: 10px 14px;
  border-radius: var(--radius-md);
}

.dropdown-status-option {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 4px 0;
}

.dropdown-status-option.healthy {
  color: var(--status-healthy);
}

.dropdown-status-option.warning {
  color: var(--status-warning);
}

.dropdown-status-option.critical {
  color: var(--status-critical);
}

.status-dot-preview {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

@media (max-width: 600px) {
  .plant-form-card {
    max-width: 100%;
    padding: var(--spacing-md);
  }
  .form-grid {
    gap: var(--spacing-sm);
  }
}
</style>
