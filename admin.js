(function () {
  const defaults = {
    heroTitle: 'پلتفرم هوشمند Trade برای کریپتو، فارکس، طلا و نقره',
    heroDescription: 'IQ Market با UX سریع، آموزش ساختارمند و تحلیل روزانه، به شما کمک می‌کند تصمیم‌های کم‌ریسک‌تر بگیرید. این محتوا آموزشی است و توصیه سرمایه‌گذاری نیست.',
    heroBadges: ['Trade Plan', 'Risk Management', 'Smart Money', 'ICT/Price Action'],
    updatedAt: new Date().toISOString()
  };

  const $ = (id) => document.getElementById(id);

  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem('marketiq.siteSettings') || '{}');
      return { ...defaults, ...stored };
    } catch {
      return defaults;
    }
  }

  function save(settings) {
    localStorage.setItem('marketiq.siteSettings', JSON.stringify(settings));
  }

  const form = $('settings-form');
  const output = $('admin-output');
  const state = load();

  $('heroTitle').value = state.heroTitle;
  $('heroDescription').value = state.heroDescription;
  $('heroBadges').value = state.heroBadges.join(', ');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const settings = {
      heroTitle: $('heroTitle').value.trim(),
      heroDescription: $('heroDescription').value.trim(),
      heroBadges: $('heroBadges').value.split(',').map((s) => s.trim()).filter(Boolean),
      updatedAt: new Date().toISOString()
    };
    save(settings);
    output.textContent = '✅ تنظیمات ذخیره شد. صفحه اصلی را رفرش کنید.';
  });

  $('reset').addEventListener('click', () => {
    save(defaults);
    $('heroTitle').value = defaults.heroTitle;
    $('heroDescription').value = defaults.heroDescription;
    $('heroBadges').value = defaults.heroBadges.join(', ');
    output.textContent = '↺ به حالت پیش‌فرض برگشت.';
  });

  $('export').addEventListener('click', () => {
    const data = localStorage.getItem('marketiq.siteSettings') || JSON.stringify(defaults, null, 2);
    output.textContent = data;
  });
})();
