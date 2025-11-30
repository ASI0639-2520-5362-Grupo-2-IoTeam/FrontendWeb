<script setup>

import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import CommunityWelcomeDialog from './CommunityWelcomeDialog.vue'
import CreatePostDialog from './CreatePostDialog.vue'
import { communityService } from '../../infrastructure/Community.Service'
import { useAuthenticationStore } from '../../../iam/services/Authentication.Store'

const experts = [
  { id: 1, initials: 'DP', name: 'Dr. Plant Expert', specialty: 'Horticulturist · Tropical plants' },
  { id: 2, initials: 'GT', name: 'Green Thumb Guru', specialty: 'Plant Care Specialist · Indoor Gardens' }
]

const guides = [
  {
    id: 1,
    title: 'Complete Guide to Monstera Care',
    author: 'Dr. Plant Expert',
    readtime: 12,
    img: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Troubleshooting Fiddle Leaf Fig',
    author: 'Green Thumb Guru',
    readtime: 8,
    img: 'https://images.unsplash.com/photo-1463320898484-cdee8141c787?q=80&w=600&auto=format&fit=crop'
  }
]

const BASE_URL = import.meta.env.VITE_PLANTCARE_API_URL

// Función para obtener la URL base correcta para Community (sin /v1)
const getCommunityBaseUrl = () => {
  let url = BASE_URL
  if (url.endsWith('/v1')) {
    url = url.replace('/v1', '')
  }
  if (url.endsWith('/')) {
    url = url.slice(0, -1)
  }
  return url
}

const posts = ref([])
const profiles = ref([])
const members = ref([]) // Nueva referencia para miembros
const comments = ref([])
const reactions = ref([])
const loading = ref(true)
const showCreateDialog = ref(false)

const toast = useToast()
const confirm = useConfirm()
const authStore = useAuthenticationStore()

const loadData = async () => {
  loading.value = true
  try {
    const communityUrl = getCommunityBaseUrl()
    
    // Obtener token limpio
    let token = localStorage.getItem('token')
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1)
    }

    const headers = {
      'Accept': '*/*',
      'Authorization': `Bearer ${token}`
    }

    // Helper para fetch seguro
    const safeFetch = async (url) => {
      try {
        const res = await fetch(url, { headers })
        if (!res.ok) throw new Error(`Status: ${res.status}`)
        const text = await res.text()
        return text ? JSON.parse(text) : [] // Manejar respuesta vacía
      } catch (e) {
        console.warn(`Falló fetch a ${url}:`, e)
        return [] // Retornar array vacío en caso de error
      }
    }

    // Cargar datos en paralelo pero de forma segura
    // Cargar datos principales
    const [postsData, profilesData, membersData, commentsData] = await Promise.all([
      safeFetch(`${communityUrl}/v1/community/posts`),
      safeFetch(`${BASE_URL}/v1/users/profile`),
      safeFetch(`${communityUrl}/v1/community/members`),
      safeFetch(`${communityUrl}/v1/community/comments`)
    ])

    posts.value = Array.isArray(postsData) ? postsData : []
    
    // Cargar likes para cada post
    const likesMap = {}
    await Promise.all(posts.value.map(async (post) => {
      try {
        const res = await communityService.getReactions(post.id)
        likesMap[post.id] = res.data // Asumimos que devuelve el número
      } catch (e) {
        console.warn(`Error cargando likes para post ${post.id}`, e)
        likesMap[post.id] = 0
      }
    }))
    reactions.value = likesMap // Guardamos el mapa de likes { postId: count }

    const profilesRaw = profilesData
    profiles.value = Array.isArray(profilesRaw) ? profilesRaw : (profilesRaw ? [profilesRaw] : [])
    members.value = Array.isArray(membersData) ? membersData : []
    comments.value = Array.isArray(commentsData) ? commentsData : []

  } catch (err) {
    console.error('Error general fetching data:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

/* 🔗 Enriquecer posts con perfil, comentarios y likes */
const enrichedPosts = computed(() =>
    posts.value.map(post => {
      const authorId = String(post.authorId || post.userId)

      // 1. Buscar en miembros (prioridad para username)
      const member = members.value.find(m => String(m.userId) === authorId)
      
      // 2. Buscar en perfiles (fallback)
      const profile = profiles.value.find(p => String(p.userId || p.id) === authorId)

      // Determinar nombre a mostrar
      const displayName = member?.username || profile?.username || profile?.fullName || 'Usuario'

      // Comentarios por post
      const postComments = comments.value
          .filter(c => String(c.postId) === String(post.id))
          .map(comment => {
            let commentDisplayName = comment.username || 'Unknown'
            const commentUserId = String(comment.userId || comment.authorId)
            
            if (!comment.username) {
                const commentMember = members.value.find(m => String(m.userId) === commentUserId)
                const commentProfile = profiles.value.find(p => String(p.userId || p.id) === commentUserId)
                commentDisplayName = commentMember?.username || commentProfile?.username || commentProfile?.fullName || 'Unknown'
            }
            
            return {
              ...comment,
              displayName: commentDisplayName,
              avatarUrl: null,
              isOwner: commentUserId === String(authStore.uuid)
            }
          })

      // Reacciones (likes)
      const likesCount = reactions.value[post.id] || 0
      
      // NOTA: El endpoint actual solo devuelve cantidad, no si el usuario dio like.
      // Por ahora hasLiked será false al recargar, pero se actualizará al interactuar.
      const hasLiked = false 

      return {
        ...post,
        displayName: displayName,
        avatarUrl: profile?.avatarUrl || null,
        location: profile?.location || null,
        time: post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Recently',
        comments: postComments,
        likes: likesCount,
        hasLiked: hasLiked,
        isOwner: authorId === String(authStore.uuid)
      }
    })
)

/* 🧩 Crear iniciales si no hay imagen */
function getInitials(name) {
  if (!name) return ''
  return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
}

const commentInputs = ref({}) // Estado para los inputs de comentarios por post

/* ❤️ Handler para dar Like */
const handleLike = async (post) => {
  if (!authStore.uuid) {
    toast.add({ severity: 'warn', summary: 'Acceso', detail: 'Debes iniciar sesión para dar like', life: 3000 })
    return
  }
  
  try {
    // Toggle like
    await communityService.createReaction(authStore.uuid, post.id)
    
    // Recargar solo los likes de este post para actualizar el contador
    const res = await communityService.getReactions(post.id)
    reactions.value = { ...reactions.value, [post.id]: res.data }
    
  } catch (error) {
    console.error('Error dando like:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar tu reacción', life: 3000 })
  }
}

/* 💬 Handler para publicar comentario */
const handlePostComment = async (post) => {
  const content = commentInputs.value[post.id]
  
  if (!content || !content.trim()) return

  if (!authStore.uuid) {
    toast.add({ severity: 'warn', summary: 'Acceso', detail: 'Debes iniciar sesión para comentar', life: 3000 })
    return
  }

  try {
    const response = await communityService.createComment(authStore.uuid, post.id, content)
    
    // Actualización optimista/local: Añadir el nuevo comentario a la lista
    // Asumimos que el backend devuelve el comentario creado
    if (response.data) {
      comments.value.push(response.data)
    } else {
      // Si no devuelve data, recargamos todo por seguridad
      loadData()
    }
    
    // Limpiar input
    commentInputs.value[post.id] = ''
    toast.add({ severity: 'success', summary: 'Comentario', detail: 'Comentario publicado', life: 2000 })
    
  } catch (error) {
    console.error('Error publicando comentario:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo publicar el comentario', life: 3000 })
  }
}

/* 🗑️ Handler para eliminar comentario */
const confirmDeleteComment = (comment) => {
  console.log('🗑️ Intentando eliminar comentario:', comment)
  
  // Intentar obtener el ID de varias formas posibles por seguridad
  const commentId = comment.id || comment.commentId || comment._id
  
  if (!commentId) {
    console.error('❌ Error: El comentario no tiene ID válido', comment)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se puede eliminar: ID no encontrado', life: 3000 })
    return
  }

  confirm.require({
    message: '¿Estás seguro de que quieres eliminar este comentario?',
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await communityService.deleteComment(String(commentId), authStore.uuid)
        
        // Actualización optimista: Eliminar de la lista local
        comments.value = comments.value.filter(c => (c.id || c.commentId || c._id) !== commentId)
        
        toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Comentario eliminado', life: 2000 })
      } catch (error) {
        console.error('Error eliminando comentario:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el comentario', life: 3000 })
      }
    }
  })
}

/* 🎉 Handlers para el dialog de bienvenida */
const handleWelcomeAccepted = () => {
  console.log('Usuario aceptó unirse a la comunidad')
  loadData() 
}

const handleWelcomeRejected = () => {
  console.log('Usuario rechazó unirse a la comunidad')
}

/* 📝 Handler para creación de post */
const handlePostCreated = () => {
  loadData() // Recargar el feed para mostrar el nuevo post
}

/* 🗑️ Handler para eliminar post */
const confirmDeletePost = (post) => {
  confirm.require({
    message: '¿Estás seguro de que quieres eliminar esta publicación?',
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await communityService.deletePost(post.id, authStore.uuid)
        toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Publicación eliminada correctamente', life: 3000 })
        loadData() // Recargar lista
      } catch (error) {
        console.error('Error deleting post:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la publicación', life: 3000 })
      }
    },
    reject: () => {
      // Cancelado
    }
  })
}
</script>

<template>
  <div class="community">
    <Toast />
    <ConfirmDialog />

    <!-- Dialog de Bienvenida -->
    <CommunityWelcomeDialog 
      @accepted="handleWelcomeAccepted"
      @rejected="handleWelcomeRejected"
    />

    <!-- Dialog de Crear Post -->
    <CreatePostDialog
      v-model:visible="showCreateDialog"
      @created="handlePostCreated"
    />

    <!-- Header + CTA -->
    <div class="header">
      <h1>Community</h1>
      <button class="btn-create" @click="showCreateDialog = true">
        <img
            src="https://fonts.gstatic.com/s/i/materialiconsoutlined/photo_camera/v1/24px.svg"
            alt="camera icon"
            class="icon"
        />
        Create Post
      </button>
    </div>

    <p class="header-comment">Connect with fellow plant enthusiasts and share your journey</p>

    <div class="layout">
      <!-- LEFT: Feed -->
      <section class="feed card">
        <header class="feed-header">
          <span class="dot"></span>
          <h2>👥 Community Feed</h2>
        </header>

        <!-- Post section -->
        <div v-if="loading" class="loading">Loading posts...</div>

        <!-- 🪴 Lista dinámica de posts -->
        <article v-for="post in enrichedPosts" :key="post.id" class="post">
          <!-- Header -->
          <div class="post-header">
            <img
                v-if="post.avatarUrl"
                :src="post.avatarUrl"
                :alt="post.displayName"
                class="avatar-img"
            />
            <div v-else class="avatar">{{ getInitials(post.displayName) }}</div>

            <div class="meta">
              <div class="name">{{ post.displayName }}</div>
              <div class="timeplace">
                {{ post.time || 'Recently' }}
                <template v-if="post.location"> · {{ post.location }}</template>
                <template v-if="post.species"> · 🌿 {{ post.species }}</template>
                <template v-if="post.tag"> · <span class="meta-tag">#{{ post.tag }}</span></template>
              </div>
            </div>

            <!-- Botón de Eliminar (Solo visible para el dueño) -->
            <button 
              v-if="post.isOwner" 
              class="btn-delete" 
              @click="confirmDeletePost(post)"
              title="Eliminar publicación"
            >
              <i class="pi pi-trash" style="font-size: 1rem;"></i>
            </button>
          </div>

          <!-- Contenido -->
          <h3 class="post-text">{{ post.title }}</h3>
          <p class="post-text">{{ post.content }}</p>
          

          <img
              v-if="post.image"
              class="post-image"
              :src="post.image"
              :alt="post.title || 'Post image'"
          />

          <!-- ⚡ Reacciones (likes y comentarios) -->
          <div class="post-actions">
            <button 
              class="icon-btn" 
              :class="{ 'active': post.hasLiked }"
              title="Like"
              @click="handleLike(post)"
            >
              <div>{{ post.hasLiked ? '❤️' : '🤍' }}</div>
              <span>{{ post.likes }}</span>
            </button>

            <button class="icon-btn" title="Comments">
              <div>💬</div>
              <span>{{ post.comments.length }}</span>
            </button>
          </div>

          <!-- 💬 Comentarios -->
          <div class="comments-section">
            <div v-if="post.comments.length" class="comments-list">
              <h4>Comments</h4>
              <div
                  v-for="comment in post.comments"
                  :key="comment.id"
                  class="comment"
              >
                <div class="comment-header">
                  <img
                      v-if="comment.avatarUrl"
                      :src="comment.avatarUrl"
                      :alt="comment.displayName"
                      class="comment-avatar"
                  />
                  <div v-else class="comment-avatar-alt">
                    {{ getInitials(comment.displayName) }}
                  </div>
                  <div>
                    <p class="comment-author">{{ comment.displayName }}</p>
                    <p class="comment-date">
                      {{ new Date(comment.createdAt).toLocaleString() }}
                    </p>
                  </div>
                  
                  <!-- Botón eliminar comentario -->
                  <button 
                    v-if="comment.isOwner"
                    class="btn-delete-comment"
                    @click="confirmDeleteComment(comment)"
                    title="Eliminar comentario"
                  >
                    <i class="pi pi-trash" style="font-size: 0.8rem;"></i>
                  </button>
                </div>
                <p class="comment-body">{{ comment.content }}</p>
              </div>
            </div>

            <!-- Input para nuevo comentario -->
            <div class="comment-input-wrapper">
              <input 
                type="text" 
                v-model="commentInputs[post.id]" 
                placeholder="Escribe un comentario..." 
                class="comment-input"
                @keyup.enter="handlePostComment(post)"
              />
              <button 
                class="btn-send" 
                @click="handlePostComment(post)"
                :disabled="!commentInputs[post.id]"
              >
                Enviar
              </button>
            </div>
          </div>
        </article>

        <div v-if="!loading && enrichedPosts.length === 0" class="empty">
          No posts available 🌿
        </div>

      </section>

      <!-- RIGHT: Sidebar -->
      <aside class="sidebar">
        <!-- Experts -->
        <section class="card">
          <h3 class="section-title">Plant Experts</h3>
          <ul class="list">
            <li class="list-item" v-for="expert in experts" :key="expert.id">
              <div class="avatar small">{{ expert.initials }}</div>
              <div class="info">
                <div class="title">
                  {{ expert.name }}
                  <span class="badge">Expert</span>
                </div>
                <div class="sub">{{ expert.specialty }}</div>
              </div>
              <button class="btn-outline">Follow</button>
            </li>
          </ul>
        </section>

        <!-- Challenges -->
        <section class="card">
          <h3 class="section-title">Active Challenges</h3>
          <div class="challenge">
            <div class="row">
              <div class="title">Winter Care Challenge</div>
              <span class="chip chip-green">Beginner</span>
            </div>
            <p class="sub">
              Keep your plants thriving through the cold season
            </p>
            <div class="row">
              <div class="mini">
                <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg>
                <span>Water Care Badge</span>
              </div>
              <button class="btn-primary sm">Join Challenge</button>
            </div>
          </div>
        </section>

        <!-- Guides -->
        <section class="card">
          <h3 class="section-title">Popular Guides</h3>
          <ul class="guides">
            <li v-for="g in guides" :key="g.id" class="guide">
              <img :src="g.img" :alt="g.title" />
              <div class="g-info">
                <div class="g-title">{{ g.title }}</div>
                <div class="g-sub">{{ g.author }} · {{ g.readtime }} min read</div>
              </div>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>



<style scoped>
:root {
  --bg: #f4f7ef;
  --card: #ffffff;
  --ink: #1f2937;
  --muted: #6b7280;
  --primary: #56b35f; /* verde suave */
  --primary-ink: #0f5132;
  --border: #e5e7eb;
  --chip: #e9f7eb;
}

.header-comment{
  margin-top: 24px;
  margin-bottom: 24px;
  color: var(--muted);
}
.community {
  background: var(--bg);
  min-height: 100%;
  padding: 24px;
  color: var(--ink);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Inter, Arial, sans-serif;
}

.header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}
.header h1 { margin: 0; font-size: 28px; }
.header p { margin: 0; color: var(--muted); }
.header .btn-primary { grid-column: 2 / 3; }

.layout {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 20px;
  align-items: flex-start;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.16);
}

.feed { padding: 16px; }
.feed-header {
  display: flex; align-items: center; margin-bottom: 8px;
}
.feed-header .dot {
  width: 10px; height: 10px; background: var(--primary); border-radius: 50%;
}
.feed-header h2 { font-size: 15px; margin: 0; color: #374151; }

.post { padding: 12px; border-top: 1px solid var(--border); }
.post:first-of-type { border-top: 0; }
.post-header { display: flex; gap: 10px; align-items: center; }
.avatar {
  width: 40px; height: 40px; border-radius: 999px;
  background: #d1fae5; color: #065f46; display: grid; place-items: center;
  font-weight: 700; letter-spacing: .5px;
}
.avatar.small { width: 36px; height: 36px; font-size: 12px; }
.meta .name { font-weight: 600; }
.meta .timeplace { font-size: 12px; color: var(--muted); }

.post-text { margin: 10px 0; line-height: 1.5; }
.post-image {
  width: 100%; height: 220px; object-fit: cover; border-radius: 12px; border: 1px solid var(--border);
}
.post-actions {
  display: flex; gap: 12px; margin-top: 10px;
}
.icon-btn {
  display: inline-flex; gap: 6px; align-items: center;
  padding: 6px 10px; border-radius: 10px; border: 1px solid var(--border);
  background: #fff; cursor: pointer; font-size: 13px; color: #374151;
}
.icon { width: 18px; height: 18px; fill: currentColor; }

.sidebar { display: grid; gap: 16px; }

.section-title { padding: 14px 16px 0 16px; margin: 0; font-size: 16px; }

.list { list-style: none; margin: 0; padding: 8px 12px 14px; display: grid; gap: 10px; }
.list-item {
  display: grid; grid-template-columns: 36px 1fr auto; gap: 10px; align-items: center;
  padding: 8px; border-radius: 10px;
}
.list-item:hover { background: #fafafa; }

.info .title { font-weight: 600; display: flex; align-items: center; gap: 8px; }
.info .sub { color: var(--muted); font-size: 12px; }

.badge {
  font-size: 11px; padding: 2px 6px; border-radius: 999px; background: var(--chip); color: var(--primary-ink); border: 1px solid #cfead3;
}

.challenge { padding: 12px 16px 16px; display: grid; gap: 10px; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.title { font-weight: 700; }
.chip { font-size: 11px; padding: 2px 8px; border-radius: 999px; border: 1px solid #d1fae5; background: #ecfdf5; color: #065f46; }
.chip-green { background: #eaffef; border-color: #cfead3; color: #166534; }
.sub { color: var(--muted); font-size: 13px; }

.mini { display: inline-flex; gap: 6px; align-items: center; color: var(--muted); font-size: 13px; }
.mini svg { width: 16px; height: 16px; fill: currentColor; }

.guides { list-style: none; margin: 0; padding: 12px 14px 16px; display: grid; gap: 12px; }
.guide { display: grid; grid-template-columns: 64px 1fr; gap: 10px; align-items: center; }
.guide img { width: 64px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); }
.g-info .g-title { font-weight: 600; }
.g-info .g-sub { font-size: 12px; color: var(--muted); }

.btn-primary {
  border: none; background: var(--primary); color: #fff; padding: 10px 14px; border-radius: 12px;
  font-weight: 600; cursor: pointer; transition: transform .02s ease, filter .2s ease;
}
.btn-primary:hover { filter: brightness(0.95); }
.btn-primary.sm { padding: 8px 12px; border-radius: 10px;background-color: #8cc63f; }

.btn-outline {
  padding: 8px 12px; border: 1px solid var(--border); border-radius: 10px; background: #fff; cursor: pointer;
  font-weight: 600;
  background-color: #8cc63f;
}
.btn-outline:hover { background-color: #0f5132; }

@media (max-width: 980px) {
  .layout { grid-template-columns: 1fr; }
  .header { grid-template-columns: 1fr; }
  .header .btn-primary { grid-column: 1 / -1; justify-self: start; }
}

.btn-create {
  background-color: #8cc63f;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-create:hover {
  background-color: #7ab133;
}

.icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1); /* lo hace blanco */
}

.loading {
  text-align: center;
  color: #777;
  padding: 12px 0;
}
.empty {
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 16px 0;
}
.post {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
}
.post:first-of-type {
  border-top: 0;
}
.post-header {
  display: flex;
  gap: 10px;
  align-items: center;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: #d1fae5;
  color: #065f46;
  display: grid;
  place-items: center;
  font-weight: 700;
}
.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}
.meta .name {
  font-weight: 600;
}
.meta .timeplace {
  font-size: 12px;
  color: #6b7280;
}
.post-text {
  margin: 10px 0;
  line-height: 1.5;
}
.post-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.feed-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 16px;
}
.feed-header .dot {
  width: 10px;
  height: 10px;
  background: #56b35f;
  border-radius: 50%;
}

.post-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.icon-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 6px 10px;
  cursor: pointer;
  transition: 0.2s;
}
.icon-btn:hover {
  background: #f9fafb;
}
.icon {
  width: 18px;
  height: 18px;
  fill: #374151;
}
.icon-btn span {
  font-size: 14px;
  color: #374151;
}

.comments-section {
  margin-top: 12px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 10px 14px;
}

.comments-list h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #374151;
}

.comment {
  border-top: 1px solid #e5e7eb;
  padding-top: 6px;
  margin-top: 6px;
}

.comment-input-wrapper {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
}

.comment-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  background-color: #ffffff !important; /* Forzar blanco */
  color: #1f2937 !important; /* Forzar texto oscuro */
}

.comment-input:focus {
  border-color: #56b35f;
}

.btn-send {
  background: #56b35f;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-send:hover {
  background: #469b4e;
}

.btn-send:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}
.comment-avatar-alt {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  display: grid;
  place-items: center;
  font-weight: 600;
}
.comment-author {
  font-weight: 600;
  font-size: 13px;
  color: #111827;
}
.comment-date {
  font-size: 11px;
  color: #6b7280;
}
.comment-body {
  font-size: 13px;
  color: #4b5563;
  margin: 4px 0 6px 40px;
}

.btn-delete {
  margin-left: auto; /* Empuja el botón a la derecha */
  background: transparent;
  border: none;
  color: #ef4444; /* Rojo */
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete:hover {
  background-color: #fee2e2;
}

.btn-delete-comment {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete-comment:hover {
  background-color: #fee2e2;
}

.meta-tag {
  color: var(--primary);
  font-weight: 500;
}

</style>
