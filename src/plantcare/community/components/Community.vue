<script setup>

import { ref, onMounted, computed } from 'vue'

const experts = [
  { id: 1, initials: 'DP', name: 'Dr. Plant Expert', specialty: 'Horticulturist · Tropical Plants' },
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

const BASE_URL = 'https://fakeapiplant.vercel.app'

const posts = ref([])
const profiles = ref([])
const comments = ref([])
const reactions = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [postsRes, profilesRes, commentsRes, reactionsRes] = await Promise.all([
      fetch(`${BASE_URL}/posts`),
      fetch(`${BASE_URL}/profiles`),
      fetch(`${BASE_URL}/comments`),
      fetch(`${BASE_URL}/reactions`)
    ])

    posts.value = await postsRes.json()
    profiles.value = await profilesRes.json()
    comments.value = await commentsRes.json()
    reactions.value = await reactionsRes.json()
  } catch (err) {
    console.error('Error fetching data:', err)
  } finally {
    loading.value = false
  }
})

/* 🔗 Enriquecer posts con perfil, comentarios y likes */
const enrichedPosts = computed(() =>
    posts.value.map(post => {
      const profile = profiles.value.find(p => String(p.id) === String(post.userId))

      // Comentarios por post
      const postComments = comments.value
          .filter(c => String(c.postId) === String(post.id))
          .map(comment => {
            const commenterProfile = profiles.value.find(p => String(p.id) === String(comment.userId))
            return {
              ...comment,
              displayName: commenterProfile?.displayName || 'Unknown',
              avatarUrl: commenterProfile?.avatarUrl || null,
              location: commenterProfile?.location || null
            }
          })

      // Reacciones (likes) por post
      const postLikes = reactions.value.filter(
          r => r.targetType === 'post' && String(r.targetId) === String(post.id) && r.type === 'like'
      )

      return {
        ...post,
        displayName: profile?.displayName || 'Unknown',
        avatarUrl: profile?.avatarUrl || null,
        location: profile?.location || null,
        comments: postComments,
        likes: postLikes.length
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
</script>

<template>
  <div class="community">
    <!-- Header + CTA -->
    <div class="header">
      <h1>Community</h1>
      <button class="btn-create">
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
              </div>
            </div>
          </div>

          <!-- Contenido -->
          <p class="post-text">{{ post.content }}</p>

          <img
              v-if="post.image"
              class="post-image"
              :src="post.image"
              :alt="post.title || 'Post image'"
          />

          <!-- ⚡ Reacciones (likes y comentarios) -->
          <div class="post-actions">
            <button class="icon-btn" title="Like">
              <div>💚</div>
              <span>{{ post.likes }}</span>
            </button>

            <button class="icon-btn" title="Comments">
              <div>💬</div>
              <span>{{ post.comments.length }}</span>
            </button>
          </div>

          <!-- 💬 Comentarios -->
          <div v-if="post.comments.length" class="comments">
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
              </div>
              <p class="comment-body">{{ comment.content }}</p>
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
.btn-primary.sm { padding: 8px 12px; border-radius: 10px; }

.btn-outline {
  padding: 8px 12px; border: 1px solid var(--border); border-radius: 10px; background: #fff; cursor: pointer;
  font-weight: 600;
}
.btn-outline:hover { background: #fafafa; }

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
.comments {
  margin-top: 12px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 10px 14px;
}
.comments h4 {
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
</style>
