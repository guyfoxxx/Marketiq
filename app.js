(function () {
  const defaults = {
    heroTitle: 'پلتفرم هوشمند Trade برای کریپتو، فارکس، طلا و نقره',
    heroDescription: 'IQ Market با UX سریع، آموزش ساختارمند و تحلیل روزانه، به شما کمک می‌کند تصمیم‌های کم‌ریسک‌تر بگیرید. این محتوا آموزشی است و توصیه سرمایه‌گذاری نیست.',
    heroBadges: ['Trade Plan', 'Risk Management', 'Smart Money', 'ICT/Price Action'],
    updatedAt: new Date().toISOString()
  };

  function getSettings() {
    try {
      const raw = localStorage.getItem('marketiq.siteSettings');
      if (!raw) return defaults;
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return defaults;
    }
  }

  const settings = getSettings();
  const titleEl = document.getElementById('hero-title');
  const descEl = document.getElementById('hero-description');
  const badgesEl = document.getElementById('hero-badges');
  const yearEl = document.getElementById('year');

  if (titleEl) titleEl.textContent = settings.heroTitle;
  if (descEl) descEl.textContent = settings.heroDescription;
  if (badgesEl) {
    badgesEl.innerHTML = '';
    settings.heroBadges.forEach((item) => {
      const span = document.createElement('span');
      span.className = 'badge';
      span.textContent = item;
      badgesEl.appendChild(span);
    });
  }
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const statusEl = document.getElementById('status');
  const listEl = document.getElementById('post-list');
  const searchEl = document.getElementById('post-search');

  let posts = [];

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function renderPosts(filter = '') {
    if (!listEl) return;
    const q = filter.trim().toLowerCase();
    const filtered = q ? posts.filter((p) => (p.text || '').toLowerCase().includes(q)) : posts;

    if (!filtered.length) {
      listEl.innerHTML = '<div class="small">موردی پیدا نشد.</div>';
      return;
    }

    listEl.innerHTML = filtered.map((p) => `
      <article class="post">
        <div class="post-meta">
          <span>${escapeHtml(p.date || '')} • #${escapeHtml(String(p.id || ''))}</span>
          <a class="btn" href="${escapeHtml(p.url || '#')}" rel="nofollow">مشاهده در تلگرام</a>
        </div>
        <p>${escapeHtml(p.text || '')}</p>
      </article>
    `).join('');
  }

  async function loadPosts() {
    if (!statusEl || !listEl) return;
    statusEl.textContent = 'در حال دریافت پست‌های کانال...';
    try {
      const res = await fetch('/api/posts?limit=100', { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      posts = (data.posts || []).slice(0, 100);
      statusEl.textContent = `تعداد ${posts.length} پست بارگذاری شد.`;
      renderPosts();
    } catch (error) {
      statusEl.innerHTML = 'دریافت پست با خطا روبه‌رو شد. مستقیم به کانال بروید: <a href="https://t.me/marketiqai" rel="nofollow">@marketiqai</a>';
      listEl.innerHTML = '';
    }
  }

  if (searchEl) searchEl.addEventListener('input', (e) => renderPosts(e.target.value));
  loadPosts();
})();
