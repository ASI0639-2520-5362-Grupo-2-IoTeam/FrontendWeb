<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { SubscriptionService } from '../../infrastructure/Subscription.Service.ts';
import { planTemplates } from '../../domain/model/planTemplates.ts';
import type { Subscription } from '../../domain/model/Subscription.model.ts';

const router = useRouter();
const subscriptionService = new SubscriptionService();
const userId = localStorage.getItem('userUuid') || 'NO-UUID';

// --- Estado ---
const subscription = ref<Subscription | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// --- Estados de modales ---
const showPaymentDialog = ref(false);
const showChangePlanDialog = ref(false);
const selectedPlan = ref<string | null>(null);

// --- Cargar suscripción ---
const loadSubscription = async () => {
  try {
    loading.value = true;
    const response = await subscriptionService.getByUserId(userId);
    subscription.value = response.data;
  } catch (err) {
    error.value = 'Unable to load subscription.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// --- Cancelar suscripción ---
const cancelSubscription = async () => {
  try {
    console.log('Cancelando suscripción del usuario:', userId);
    await subscriptionService.cancel(userId);
    await loadSubscription();
  } catch (err) {
    console.error(err);
  }
};

// --- Simular pago / reactivar ---
const reactivateSubscription = async () => {
  showPaymentDialog.value = true;
};

// --- Confirmar pago / reactivar ---
const confirmPayment = async () => {
  showPaymentDialog.value = false;
  try {
    console.log('Reactivando suscripción del usuario:', userId);
    await subscriptionService.reactivate(userId);
    await loadSubscription();
  } catch (err) {
    console.error(err);
  }
};

// --- Cambiar plan ---
const openChangePlanDialog = () => {
  showChangePlanDialog.value = true;
};

const confirmPlanChange = async () => {
  if (!selectedPlan.value || !subscription.value) return;
  try {
    console.log('Cambiando plan a:', selectedPlan.value);
    const response = await subscriptionService.subscribeOrChangePlan({
      userId,
      planType: selectedPlan.value
    });
    console.log('Respuesta change plan:', response);
    await loadSubscription();
  } catch (err) {
    console.error(err);
  } finally {
    showChangePlanDialog.value = false;
  }
};

// --- Botón de volver ---
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadSubscription();
});
</script>

<template>
  <div class="manage-subscription">
    <!-- Botón de volver -->
    <div class="back-button">
      <Button
          icon="pi pi-arrow-left"
          label="Back"
          class="p-button-text"
          @click="goBack"
      />
    </div>

    <h1 class="title">Manage Subscription</h1>

    <div v-if="loading">Loading subscription...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else-if="subscription">
      <div class="card">
        <h2>Current Plan: {{ subscription.planName }}</h2>

        <p>
          {{
            subscription.status === 'ACTIVE'
                ? '🟢 Active'
                : subscription.status === 'CANCELLED'
                    ? '🔴 Cancelled'
                    : `⚪ ${subscription.status}`
          }}
        </p>

        <p
            v-if="subscription?.planType !== 'NONE' && subscription?.status === 'ACTIVE' && subscription?.nextBillingDate"
        >
          Next billing date:
          {{
            new Date(subscription.nextBillingDate).toLocaleString('en-US', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })
          }}
        </p>
        <p v-if="subscription?.planName === 'NONE'" class="text-gray-500 italic">
          No tienes ningún plan activo. Suscríbete para comenzar.
        </p>


        <div class="actions">
          <!-- Botón para cancelar (solo si está activa y tiene plan real) -->
          <Button
              v-if="subscription?.status === 'ACTIVE' && subscription?.planType !== 'NONE'"
              label="Cancelar suscripción"
              icon="pi pi-times"
              class="p-button-danger"
              @click="cancelSubscription"
          />

          <!-- Botón para reactivar (solo si está cancelada y tiene plan real) -->
          <Button
              v-if="subscription?.status === 'CANCELLED' && subscription?.planType !== 'NONE'"
              label="Reactivar suscripción"
              icon="pi pi-refresh"
              class="p-button-success"
              @click="reactivateSubscription"
          />

          <!-- Botón para activar o suscribirse (solo si plan = NONE) -->
          <Button
              v-if="subscription?.planType === 'NONE'"
              label="Activar suscripción"
              icon="pi pi-credit-card"
              class="p-button-success"
              @click="openChangePlanDialog"
          />

          <!-- Botón para cambiar plan (solo si tiene plan real) -->
          <Button
              v-if="subscription?.planType !== 'NONE'"
              label="Change Plan"
              outlined
              @click="openChangePlanDialog"
          />
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <Dialog v-model:visible="showPaymentDialog" header="Simulate Payment" modal>
      <p>Confirm payment to reactivate your subscription.</p>
      <div class="dialog-actions">
        <Button label="Confirm Payment" @click="confirmPayment" />
        <Button label="Cancel" outlined @click="showPaymentDialog = false" />
      </div>
    </Dialog>

    <!-- Change Plan Modal -->
    <Dialog v-model:visible="showChangePlanDialog" header="Change Plan" modal>
      <div class="plans-list">
        <div
            v-for="(plan, key) in planTemplates"
            :key="key"
            class="plan-option"
            :class="{ selected: selectedPlan === key }"
            @click="selectedPlan = key"
        >
          <h3>{{ plan.name }}</h3>
          <p>{{ plan.description }}</p>
          <strong>${{ plan.price }} / {{ plan.billingCycle }}</strong>
        </div>
      </div>

      <div class="dialog-actions">
        <Button
            label="Confirm Change"
            :disabled="!selectedPlan"
            @click="confirmPlanChange"
        />
        <Button label="Cancel" outlined @click="showChangePlanDialog = false" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.manage-subscription {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.back-button {
  margin-bottom: 0.5rem;
}

.card {
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.plans-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.plan-option {
  border: 2px solid #ddd;
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: border 0.2s ease;
}

.plan-option.selected {
  border-color: #22c55e;
  background: #f0fdf4;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}
</style>