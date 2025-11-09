<script setup lang="ts">
import {ref, onMounted} from 'vue';
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
const paymentContext = ref< 'REACTIVATE' | 'NEW' | null >(null);

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
    //console.log('Cancelando suscripción del usuario:', userId);
    await subscriptionService.cancel(userId);
    await loadSubscription();
  } catch (err) {
    console.error(err);
  }
};

// --- Simular pago / reactivar ---
const reactivateSubscription = async () => {
  paymentContext.value = 'REACTIVATE';
  showPaymentDialog.value = true;
};

// --- Confirmar pago / reactivar ---
// --- Confirmar pago / reactivar ---
const confirmPayment = async () => {
  showPaymentDialog.value = false;

  try {
    const status = subscription.value?.status;
    console.log('Estado previo al pago:', status);

    if (status === 'CANCELLED') {
      console.log('Reactivando suscripción en backend...');
      try {
        await subscriptionService.reactivate(userId);
        console.log('Reactivación completada correctamente.');
      } catch (reactivateError) {
        console.error('Error al reactivar en backend:', reactivateError);
      }
    } else {
      console.log('Pago simulado confirmado (plan nuevo o activo).');
    }

    await loadSubscription();

  } catch (err) {
    console.error('Error en confirmPayment:', err);
  }
};


// --- Cambiar plan ---
const openChangePlanDialog = () => {
  showChangePlanDialog.value = true;
};

const confirmPlanChange = async () => {
  if (!selectedPlan.value) return;
  try {
    const currentPlan = subscription.value?.planName || 'NONE';
    const currentStatus = subscription.value?.status || 'NONE';
    console.log('Plan actual:', currentPlan, '| Estado actual:', currentStatus);

    const wasFreeOrCancelled = !currentPlan || currentPlan === 'NONE' || currentStatus === 'CANCELLED';

    const response = await subscriptionService.subscribeOrChangePlan({
      userId,
      planType: selectedPlan.value
    });
    console.log('Respuesta change plan:', response);

    if (wasFreeOrCancelled && selectedPlan.value !== 'NONE') {
      //console.log('Mostrando modal de pago (venía de Free o Cancelled)');
      showPaymentDialog.value = true;
    } else {
      //console.log('Cambio normal de plan, actualizando datos...');
      await loadSubscription();
    }

  } catch (err) {
    console.error('Error cambiando plan:', err);
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
        <h2>
          Current Plan:
          {{
            subscription.planName.type === 'NONE'
                ? 'Free Plan'
                : subscription.planName.type
          }}
        </h2>

        <p v-if="subscription.planName.type !== 'NONE'">
          {{
            subscription.status === 'ACTIVE'
                ? '🟢 Active'
                : subscription.status === 'CANCELLED'
                    ? '🔴 Cancelled — You won’t be charged again and your benefits remain until one month after your last payment.'
                    : `⚪ ${subscription.status}`
          }}
        </p>

        <p
            v-if="subscription.planName.type !== 'NONE' &&
                 subscription.status === 'ACTIVE' &&
                 subscription.nextBillingDate"
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
        <p v-if="subscription.planName.type === 'NONE'" class="text-gray-500 italic">
          You are on FreePlan. Choose a paid plan to enable features.
        </p>


        <div class="actions">
          <!-- Botón para cancelar -->
          <Button
              v-if="subscription.status === 'ACTIVE' && subscription.planName.type !== 'NONE'"
              label="Cancelar suscripción"
              icon="pi pi-times"
              class="p-button-danger"
              @click="cancelSubscription"
          />

          <!-- Botón para reactivar -->
          <Button
              v-if="subscription.status === 'CANCELLED' && subscription.planName.type !== 'NONE'"
              label="Reactivar suscripción"
              icon="pi pi-refresh"
              class="p-button-success"
              @click="reactivateSubscription"
          />



          <!-- Botón para cambiar plan o suscribirse -->
          <Button
              v-if="subscription.planName.type === 'NONE'"
              label="Elegir Plan"
              icon="pi pi-credit-card"
              class="p-button-success"
              @click="openChangePlanDialog"
          />
          <!-- Botón para cambiar plan -->
          <Button
              v-if="subscription.planName.type !== 'NONE'"
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
          <strong>
            {{ plan.price > 0 ? `S/.${plan.price} / ${plan.billingCycle}` : 'Free' }}
          </strong>
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
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.back-button {
  margin-bottom: var(--spacing-sm);
}

/* Tarjeta principal */
.card {
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Acciones */
.actions {
  margin-top: var(--spacing-lg);
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

/* Lista de planes */
.plans-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin: var(--spacing-md) 0;
}

/* Plan individual */
.plan-option {
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
}

.plan-option:hover {
  border-color: var(--primary-green);
  background: var(--primary-green-light);
}

.plan-option.selected {
  border-color: var(--primary-green);
  background: var(--primary-green-light);
}

/* Diálogo */
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

/* Títulos */
.title, h2, h3 {
  color: var(--text-primary);
  transition: color 0.3s ease;
}

/* Texto auxiliar */
.text-gray-500 {
  color: var(--text-secondary);
  font-style: italic;
}
.p-dialog {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: var(--shadow-lg) !important;
}

.p-dialog .p-dialog-header {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.p-dialog .p-dialog-content {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

.p-dialog .p-dialog-footer {
  background: var(--bg-card) !important;
  border-top: 1px solid var(--border-color) !important;
}
</style>