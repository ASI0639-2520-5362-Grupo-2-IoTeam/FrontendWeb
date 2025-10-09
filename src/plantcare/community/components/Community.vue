<script setup>
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

    <p>Connect with fellow plant enthusiasts and share your journey</p>

    <div class="layout">
      <!-- LEFT: Feed -->
      <section class="feed card">
        <header class="feed-header">
          <span class="dot"></span>
          <h2>Community Feed</h2>
        </header>

        <!-- Post 1 -->
        <article class="post">
          <div class="post-header">
            <div class="avatar">SC</div>
            <div class="meta">
              <div class="name">Sarah Chen</div>
              <div class="timeplace">2 hours ago · San Francisco, CA</div>
            </div>
          </div>

          <p class="post-text">
            My Monstera finally grew a new leaf after 3 months! The fenestrations are
            coming in beautifully 🪴
          </p>

          <img
              class="post-image"
              src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop"
              alt="Monstera"
          />

          <div class="post-actions">
            <button class="icon-btn" title="Like">
              <svg viewBox="0 0 24 24" class="icon"><path d="M12.1 8.64l-.1.1-.11-.11C10.14 6.7 7.1 7.24 6 9.28 4.9 11.32 6.24 14 8.5 14h.55l-.43 3.38-.02.23c0 .41.34.75.75.75.18 0 .35-.06.49-.18L12 16.1l2.16 2.08c.14.12.31.19.5.19.41 0 .75-.34.75-.75l-.02-.23L15 14h.5c2.26 0 3.6-2.68 2.5-4.72-1.1-2.04-4.14-2.58-5.9-.64z"/></svg>
              <span>24</span>
            </button>
            <button class="icon-btn" title="Comments">
              <svg viewBox="0 0 24 24" class="icon"><path d="M20 2H4a2 2 0 00-2 2v14l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
              <span>8</span>
            </button>
            <button class="icon-btn" title="Share">
              <svg viewBox="0 0 24 24" class="icon"><path d="M18 8a3 3 0 10-2.83-4H12a6 6 0 00-6 6v2H4a2 2 0 000 4h2v2a6 6 0 006 6h3.17A3 3 0 1018 20a3 3 0 00-2.83-2H12a2 2 0 01-2-2v-2h3.17A3 3 0 1018 8z"/></svg>
              <span>Share</span>
            </button>
          </div>
        </article>

        <!-- Post 2 -->
        <article class="post">
          <div class="post-header">
            <div class="avatar">MR</div>
            <div class="meta">
              <div class="name">Marcus Rivera</div>
              <div class="timeplace">3 hours ago · Austin, TX</div>
            </div>
          </div>
          <p class="post-text">
            Anyone else struggling with their Fiddle Leaf Fig dropping leaves? I've tried
            adjusting watering schedule but no luck so far. Any tips?
          </p>
          <div class="post-actions">
            <button class="icon-btn"><svg viewBox="0 0 24 24" class="icon"><path d="M12.1 8.64l-.1.1-.11-.11C10.14 6.7 7.1 7.24 6 9.28 4.9 11.32 6.24 14 8.5 14h.55l-.43 3.38-.02.23c0 .41.34.75.75.75.18 0 .35-.06.49-.18L12 16.1l2.16 2.08c.14.12.31.19.5.19.41 0 .75-.34.75-.75l-.02-.23L15 14h.5c2.26 0 3.6-2.68 2.5-4.72-1.1-2.04-4.14-2.58-5.9-.64z"/></svg><span>12</span></button>
            <button class="icon-btn"><svg viewBox="0 0 24 24" class="icon"><path d="M20 2H4a2 2 0 00-2 2v14l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg><span>15</span></button>
            <button class="icon-btn"><svg viewBox="0 0 24 24" class="icon"><path d="M18 8a3 3 0 10-2.83-4H12a6 6 0 00-6 6v2H4a2 2 0 000 4h2v2a6 6 0 006 6h3.17A3 3 0 1018 20a3 3 0 00-2.83-2H12a2 2 0 01-2-2v-2h3.17A3 3 0 1018 8z"/></svg><span>Share</span></button>
          </div>
        </article>
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
  box-shadow: 0 6px 18px rgba(0,0,0,0.04);
}

.feed { padding: 16px; }
.feed-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
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
</style>
