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

      <div class="field full">
        <label for="bio">Bio</label>
        <Textarea id="bio" v-model="form.bio" rows="4" placeholder="Describe your plant..." />
      </div>

      <div v-if="serverError.message" class="server-error">{{ serverError.message }}</div>

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
import { useAuthenticationStore } from '../../../iam/services/Authentication.Store';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import { PlantsService } from '../../infrastructure/plats.services';
import type { Plant } from '../../domain/model/plants.entity';

const router = useRouter();
const plantsService = new PlantsService();

const authStore = useAuthenticationStore();

const emptyState = (): Partial<Plant> => ({
  name: '',
  type: '',
  imgUrl: '',
  bio: '',
  location: ''
});

const form = reactive<Partial<Plant>>({ ...emptyState() });
const errors = reactive<Record<string, string>>({});
const serverError = reactive<{ message: string | null }>({ message: null });

const validate = () => {
  errors.name = form.name && form.name.trim() ? '' : 'Name is required';
  errors.type = form.type && form.type.trim() ? '' : 'Type is required';
  return !Object.values(errors).some(v => v);
};

const onSubmit = async () => {
  serverError.message = null;
  if (!validate()) return;

  if (!authStore.isSignedIn || !authStore.token) {
    serverError.message = 'You must be signed in to create a plant. Redirecting...';
    setTimeout(() => router.push({ name: 'SignIn' }), 2000);
    return;
  }

  const userId = authStore.uuid || localStorage.getItem('userUuid') || '';
  if (!userId) {
    serverError.message = 'No userId found to associate the plant.';
    return;
  }

  const payload = {
    userId,
    name: String(form.name || '').trim(),
    type: String(form.type || '').trim(),
    imgUrl: String(form.imgUrl || '').trim() || 'https://via.placeholder.com/180',
    bio: String(form.bio || '').trim(),
    location: String(form.location || '').trim()
  };

  try {
    const createResponse = await plantsService.createPlant(payload);
    const newPlantId = createResponse.data.id;
    if (newPlantId) {
      const now = new Date().toISOString();
      await plantsService.waterPlant(newPlantId, now);
    }
    router.push('/plants');
  } catch (err: any) {
    if (err?.response?.status === 401) {
      serverError.message = 'Session expired. Please sign in again.';
      setTimeout(() => {
        authStore.signOut();
        router.push({ name: 'SignIn' });
      }, 2000);
    } else if (err?.response?.status === 403) {
      serverError.message = 'You do not have permission to create plants.';
    } else if (err?.response?.status === 400) {
      const backendMsg = err?.response?.data?.message || err?.response?.data || 'Invalid data';
      serverError.message = `Validation error: ${backendMsg}`;
    } else {
      const backendMsg = err?.response?.data?.message || err?.message || 'Unknown error';
      serverError.message = `Error: ${backendMsg}`;
    }
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

.server-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(255,0,0,0.06);
  border: 1px solid rgba(255,0,0,0.12);
  color: var(--status-critical);
  border-radius: 6px;
  font-size: 13px;
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
