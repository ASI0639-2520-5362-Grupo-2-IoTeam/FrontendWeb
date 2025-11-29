<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthenticationStore } from '../../iam/services/Authentication.Store'
import { CommunityService } from '../services/Community.Service'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const showDialog = ref(false)
const authStore = useAuthenticationStore()
const communityService = new CommunityService()
const toast = useToast()
const isLoading = ref(false) // Estado de carga para el botón de aceptar

// Props para controlar el dialog desde el componente padre
const emit = defineEmits(['accepted', 'rejected'])

onMounted(async () => {
  // 1. Validar autenticación
  if (!authStore.uuid) {
    console.log('[CommunityWelcomeDialog] Usuario no autenticado')
    return
  }

  // 2. Verificar persistencia local (optimización)
  const savedUserId = localStorage.getItem('hasJoinedCommunity')
  if (savedUserId === authStore.uuid) {
    console.log('[CommunityWelcomeDialog] Usuario ya validado localmente')
    return
  }

  // Limpiar si hay un usuario anterior guardado
  if (savedUserId) localStorage.removeItem('hasJoinedCommunity')

  // 3. Verificar con el Backend (Fuente de verdad)
  try {
    console.log('[CommunityWelcomeDialog] Verificando membresía en backend...')
    const isMember = await communityService.checkMembership(authStore.uuid)
    
    if (isMember) {
      console.log('[CommunityWelcomeDialog] Usuario ya es miembro (Backend)')
      localStorage.setItem('hasJoinedCommunity', authStore.uuid)
      return
    }
    
    // 4. Si no es miembro, mostrar dialog
    console.log('[CommunityWelcomeDialog] Usuario NO es miembro -> Mostrar Dialog')
    setTimeout(() => {
      showDialog.value = true
    }, 500) // Pequeño delay para suavidad
    
  } catch (error) {
    console.error('[CommunityWelcomeDialog] Error en verificación inicial:', error)
    // En caso de duda (error de red), mostramos el dialog para permitir reintentar
    showDialog.value = true
  }
})

const handleAccept = async () => {
  if (!authStore.uuid) return

  try {
    isLoading.value = true
    console.log('[CommunityWelcomeDialog] Intentando registrar usuario...')
    
    await communityService.joinCommunity(authStore.uuid)
    
    // Éxito
    handleSuccess('¡Bienvenido a la comunidad! 🌿')

  } catch (error) {
    console.error('[CommunityWelcomeDialog] Error al registrar:', error)
    
    // Si el backend dice que ya existe (409) o prohíbe crear porque ya existe (403)
    // Lo tratamos como éxito para el usuario
    if (error.response && (error.response.status === 409 || error.response.status === 403)) {
      console.log('[CommunityWelcomeDialog] El usuario ya estaba registrado (409/403)')
      handleSuccess('¡Ya eres parte de la comunidad!')
      return
    }
    
    // Error real
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo completar el registro. Intenta nuevamente.',
      life: 3000
    })
  } finally {
    isLoading.value = false
  }
}

const handleSuccess = (message) => {
  localStorage.setItem('hasJoinedCommunity', authStore.uuid)
  showDialog.value = false
  emit('accepted')
  toast.add({
    severity: 'success',
    summary: '¡Éxito!',
    detail: message,
    life: 3000
  })
}

const handleReject = () => {
  showDialog.value = false
  emit('rejected')
  
  // Redirigir al dashboard después de la animación
  setTimeout(() => {
    router.push({ name: 'Dashboard' })
  }, 300)
}

// Prevenir cerrar el dialog clickeando fuera
const handleBackdropClick = () => {
  // No hacer nada - el usuario debe elegir explícitamente
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="showDialog" class="dialog-overlay" @click="handleBackdropClick">
        <Transition name="dialog-scale">
          <div v-if="showDialog" class="dialog-container" @click.stop>
            <!-- Icono decorativo -->
            <div class="dialog-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>

            <!-- Contenido del modal -->
            <div class="dialog-content">
              <h2 class="dialog-title">¡Bienvenido a la Comunidad! 🌿</h2>
              <p class="dialog-description">
                Únete a nuestra comunidad de amantes de las plantas para poder:
              </p>
              
              <ul class="features-list">
                <li class="feature-item">
                  <span class="feature-icon">👁️</span>
                  <span>Visualizar publicaciones de otros usuarios</span>
                </li>
                <li class="feature-item">
                  <span class="feature-icon">💬</span>
                  <span>Comentar y compartir experiencias</span>
                </li>
                <li class="feature-item">
                  <span class="feature-icon">🌱</span>
                  <span>Crear tus propios posts sobre plantas</span>
                </li>
                <li class="feature-item">
                  <span class="feature-icon">🤝</span>
                  <span>Conectar con otros entusiastas</span>
                </li>
              </ul>

              <p class="dialog-note">
                Al unirte, podrás disfrutar de todo el contenido de la comunidad.
              </p>
            </div>

            <!-- Botones de acción -->
            <div class="dialog-actions">
              <button class="btn btn-reject" @click="handleReject">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Rechazar
              </button>
              <button class="btn btn-accept" @click="handleAccept" :disabled="isLoading">
                <svg v-if="!isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <svg v-else class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                {{ isLoading ? 'Uniéndose...' : '¡Unirse ahora!' }}
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
  max-width: 540px;
  width: 100%;
  overflow: hidden;
  transform-origin: center;
}

/* Icono decorativo superior */
.dialog-icon {
  background: linear-gradient(135deg, #8cc63f 0%, #6fa82e 100%);
  color: white;
  padding: 32px;
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
  width: 64px;
  height: 64px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

/* Contenido del dialog */
.dialog-content {
  padding: 32px;
}

.dialog-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
  text-align: center;
  line-height: 1.3;
}

.dialog-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px 0;
  text-align: center;
  line-height: 1.6;
}

/* Lista de características */
.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.feature-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateX(4px);
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-icon {
  font-size: 24px;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.feature-item span:last-child {
  font-size: 15px;
  color: #374151;
  font-weight: 500;
  line-height: 1.4;
}

/* Nota adicional */
.dialog-note {
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
  margin: 0;
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 12px;
  line-height: 1.5;
}

/* Acciones (botones) */
.dialog-actions {
  padding: 24px 32px 32px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn svg {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.btn:hover svg {
  transform: scale(1.1);
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.btn:active::before {
  width: 300px;
  height: 300px;
}

.btn-reject {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-reject:hover {
  background: #e5e7eb;
  color: #374151;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-reject:active {
  transform: translateY(0);
}

.btn-accept {
  background: linear-gradient(135deg, #8cc63f 0%, #7ab133 100%);
  color: white;
  border: 2px solid #8cc63f;
  box-shadow: 0 4px 12px rgba(140, 198, 63, 0.3);
}

.btn-accept:hover {
  background: linear-gradient(135deg, #7ab133 0%, #6fa82e 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(140, 198, 63, 0.4);
}

.btn-accept:active {
  transform: translateY(0);
}

.btn-accept:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  animation: none;
}

.btn-accept:disabled:hover {
  transform: none;
  box-shadow: 0 4px 12px rgba(140, 198, 63, 0.3);
}

/* Spinner animation */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Animaciones */
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

  .dialog-icon {
    padding: 24px;
  }

  .dialog-icon svg {
    width: 48px;
    height: 48px;
  }

  .dialog-content {
    padding: 24px 20px;
  }

  .dialog-title {
    font-size: 24px;
  }

  .dialog-description {
    font-size: 15px;
  }

  .dialog-actions {
    padding: 20px;
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .feature-item {
    padding: 10px 12px;
  }

  .feature-icon {
    width: 32px;
    height: 32px;
    font-size: 20px;
  }
}

/* Animación pulsante sutil en el botón de aceptar */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(140, 198, 63, 0.3);
  }
  50% {
    box-shadow: 0 4px 20px rgba(140, 198, 63, 0.5);
  }
}

.btn-accept {
  animation: pulse 2s ease-in-out infinite;
}

.btn-accept:hover {
  animation: none;
}
</style>
