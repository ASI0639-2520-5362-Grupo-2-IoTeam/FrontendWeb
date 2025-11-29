<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { communityService } from '../services/Community.Service'
import { useAuthenticationStore } from '../../iam/services/Authentication.Store'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'created'])

const toast = useToast()
const authStore = useAuthenticationStore()

const form = ref({
  title: '',
  content: '',
  species: '',
  tag: ''
})

const loading = ref(false)
const submitted = ref(false)

// Reset form when dialog opens
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

const closeDialog = () => {
  emit('update:visible', false)
}

const resetForm = () => {
  form.value = {
    title: '',
    content: '',
    species: '',
    tag: ''
  }
  submitted.value = false
}

const handleSubmit = async () => {
  submitted.value = true

  // Validación básica
  if (!form.value.title || !form.value.content || !form.value.species || !form.value.tag) {
    return
  }

  loading.value = true

  try {
    const postData = {
      ...form.value,
      userId: authStore.uuid
    }

    await communityService.createPost(postData)

    toast.add({
      severity: 'success',
      summary: '¡Post creado!',
      detail: 'Tu publicación se ha compartido con la comunidad.',
      life: 3000
    })

    emit('created')
    closeDialog()
  } catch (error) {
    console.error('Error creating post:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo crear la publicación. Intenta nuevamente.',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="visible" class="dialog-overlay" @click="closeDialog">
        <Transition name="dialog-scale">
          <div v-if="visible" class="dialog-container" @click.stop>
            <!-- Icono decorativo -->
            <div class="dialog-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>

            <!-- Contenido del modal -->
            <div class="dialog-content">
              <h2 class="dialog-title">Crear Nueva Publicación 🌿</h2>
              <p class="dialog-description">Comparte tus experiencias con la comunidad</p>

              <div class="form-grid">
                <div class="field">
                  <label for="title">Título</label>
                  <InputText 
                    id="title" 
                    v-model="form.title" 
                    :class="{ 'p-invalid': submitted && !form.title }"
                    placeholder="Ej: Mi Monstera está triste..."
                  />
                  <small class="p-error" v-if="submitted && !form.title">Requerido</small>
                </div>

                <div class="field-row">
                  <div class="field">
                    <label for="species">Especie</label>
                    <InputText 
                      id="species" 
                      v-model="form.species" 
                      :class="{ 'p-invalid': submitted && !form.species }"
                      placeholder="Ej: Monstera"
                    />
                    <small class="p-error" v-if="submitted && !form.species">Requerido</small>
                  </div>

                  <div class="field">
                    <label for="tag">Etiqueta</label>
                    <InputText 
                      id="tag" 
                      v-model="form.tag" 
                      :class="{ 'p-invalid': submitted && !form.tag }"
                      placeholder="Ej: Ayuda"
                    />
                    <small class="p-error" v-if="submitted && !form.tag">Requerido</small>
                  </div>
                </div>

                <div class="field">
                  <label for="content">Contenido</label>
                  <Textarea 
                    id="content" 
                    v-model="form.content" 
                    rows="4" 
                    :class="{ 'p-invalid': submitted && !form.content }"
                    placeholder="Escribe aquí..."
                  />
                  <small class="p-error" v-if="submitted && !form.content">Requerido</small>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="dialog-actions">
              <button class="btn btn-cancel" @click="closeDialog">
                Cancelar
              </button>
              <button class="btn btn-submit" @click="handleSubmit" :disabled="loading">
                <svg v-if="loading" class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                <span v-else>Publicar</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay del dialog */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

/* Container del dialog */
.dialog-container {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 24px;
  box-shadow: 
    0 24px 48px rgba(0, 0, 0, 0.15),
    0 12px 24px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
  transform-origin: center;
}

/* Icono decorativo superior */
.dialog-icon {
  background: linear-gradient(135deg, #8cc63f 0%, #6fa82e 100%);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.dialog-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
}

.dialog-icon svg {
  width: 48px;
  height: 48px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

/* Contenido del dialog */
.dialog-content {
  padding: 24px 32px 0;
}

.dialog-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  text-align: center;
}

.dialog-description {
  font-size: 15px;
  color: #6b7280;
  margin: 0 0 24px 0;
  text-align: center;
}

/* Formulario */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

small.p-error {
  color: #ef4444;
  font-size: 12px;
}

/* Acciones (botones) */
.dialog-actions {
  padding: 24px 32px 32px;
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.btn-cancel:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-submit {
  background: linear-gradient(135deg, #8cc63f 0%, #7ab133 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(140, 198, 63, 0.3);
}

.btn-submit:hover {
  background: linear-gradient(135deg, #7ab133 0%, #6fa82e 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(140, 198, 63, 0.4);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Animaciones de entrada/salida */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-scale-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialog-scale-leave-active {
  transition: all 0.2s ease;
}

.dialog-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.dialog-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 640px) {
  .dialog-container {
    margin: 16px;
    border-radius: 20px;
  }
  .field-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* Forzar estilos de inputs */
:deep(.p-inputtext),
:deep(.p-textarea) {
  background-color: #ffffff !important;
  color: #1f2937 !important;
  border-color: #d1d5db;
}

:deep(.p-inputtext:focus),
:deep(.p-textarea:focus) {
  border-color: #8cc63f !important;
  box-shadow: 0 0 0 2px rgba(140, 198, 63, 0.2) !important;
}
</style>
