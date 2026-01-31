// ===== smooth scroll to form (на всякий случай) =====
function scrollToForm(){
  const el = document.getElementById('contact-form');
  if (el) el.scrollIntoView({behavior:'smooth'});
}

// Обработка формы
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Получаем данные формы
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };
            
            // Здесь можно добавить отправку данных на сервер
            // Например, через fetch API или другой метод
            
            // Показываем сообщение об успехе
            showSuccessMessage();
            
            // Очищаем форму
            form.reset();
        });
    }
    
    // Добавляем плавную прокрутку для всех якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Анимация появления элементов при прокрутке
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Применяем анимацию к элементам
    const animatedElements = document.querySelectorAll('.step, .service-card, .problem-item, .advantage-item, .audience-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Функция показа сообщения об успехе
function showSuccessMessage() {
    const form = document.getElementById('contactForm');
    const button = form.querySelector('.cta-button');
    const originalText = button.textContent;
    
    button.textContent = 'Заявка отправлена!';
    button.style.background = '#10B981';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 3000);
}

// Валидация телефона
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Удаляем все нецифровые символы кроме +, пробелов, скобок и дефисов
            let value = e.target.value.replace(/[^\d+\s()\-]/g, '');
            e.target.value = value;
        });
    }
});

// ===== reveal on scroll =====
(function () {
  const els = Array.from(document.querySelectorAll('.reveal, .reveal-stagger'));
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('is-visible');
    });
  }, { threshold: 0.15 });

  els.forEach((el) => io.observe(el));
})();

// ===== Hero layered parallax =====
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 901) return;

  const hero = document.querySelector('.hero');
  const card = document.querySelector('.hero-parallax-card');
  if (!hero || !card) return;

  const speedBg = 0.18;   // фон — очень медленно
  const speedCard = 0.35; // карточка — чуть быстрее

  const onScroll = () => {
    const rect = hero.getBoundingClientRect();
    const offset = -rect.top;

    hero.style.setProperty('--bg-shift', offset * speedBg + 'px');
    card.style.transform = `translateY(${offset * speedCard}px)`;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ===== mobile nav toggle =====
(function(){
  const btn = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobileNav');
  if (!btn || !menu) return;

  const close = () => {
    menu.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  };

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
  });

  // закрывать меню при клике по ссылке
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // закрывать по Esc
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

// ===== Bitrix24 lead form =====
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]')?.value.trim() || '';
    const phone = form.querySelector('[name="phone"]')?.value.trim() || '';
    const message = form.querySelector('[name="message"]')?.value.trim() || '';

    if (!phone) {
      alert('Пожалуйста, укажите телефон');
      return;
    }

    try {
      const res = await fetch('/send.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        console.error('Server/Bitrix error:', data);
        alert('Ошибка отправки. Попробуйте позже.');
        return;
      }

      form.reset();
      alert('Заявка отправлена. Мы свяжемся с вами.');
    } catch (err) {
      console.error(err);
      alert('Ошибка соединения. Попробуйте позже.');
    }
  });
});

// ===== Premium mobile: smooth anchors + header glass + sticky CTA logic =====
(function(){
  // 1) smooth anchors (nice on iOS)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;

      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // 2) header glass on scroll
  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero');
  const sticky = document.querySelector('.sticky-cta');

  const update = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;

    if (header){
      header.classList.toggle('is-scrolled', y > 8);
    }

    // 3) show sticky CTA only after Hero
    if (sticky && hero){
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      sticky.style.opacity = (y > heroBottom - 120) ? '1' : '0';
      sticky.style.pointerEvents = (y > heroBottom - 120) ? 'auto' : 'none';
      sticky.style.transition = 'opacity .2s ease';
    }
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

// ===== scroll progress line =====
(function () {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  const update = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  bar.style.width = progress.toFixed(2) + '%';
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

// ===== iOS premium parallax (lightweight, rAF) =====
(function(){
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIOS) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hero = document.querySelector('.hero');
  const heroCard = document.querySelector('.hero-card');

  // медиа-блоки (фон-картинки в 50/50 секциях)
  const mediaBlocks = Array.from(document.querySelectorAll(
    '.problems-media, .about-media, .approach-media, .services-media, .why-media, .who-media'
  ));

  let ticking = false;

  const apply = () => {
    ticking = false;

    const y = window.scrollY || document.documentElement.scrollTop || 0;

    // 1) Hero layered parallax (очень мягко)
    if (hero && heroCard){
      const rect = hero.getBoundingClientRect();
      const offset = -rect.top;                // сколько hero "уехал"
      const bgShift = Math.min(offset * 0.10, 28);   // фон: медленно
      const cardShift = Math.min(offset * 0.18, 44); // карточка: чуть быстрее

      // Двигаем фон через transform на ::before нельзя напрямую,
      // поэтому двигаем сам hero как слой (компенсируем ощущение)
      heroCard.style.transform = `translate3d(0, ${cardShift}px, 0)`;
      hero.style.setProperty('--ios-bg-shift', `${bgShift}px`);
    }

    // 2) Media blocks parallax (очень мягко, без лагов)
    for (const el of mediaBlocks){
      const r = el.getBoundingClientRect();
      // когда элемент вблизи экрана — двигаем чуть-чуть
      const center = (r.top + r.bottom) / 2;
      const viewportCenter = window.innerHeight / 2;
      const delta = (center - viewportCenter) * 0.03; // коэффициент маленький = "дорого"
      el.style.transform = `translate3d(0, ${delta.toFixed(2)}px, 0)`;
    }
  };

  const onScroll = () => {
    if (!ticking){
      ticking = true;
      requestAnimationFrame(apply);
    }
  };

  // CSS-хук для hero bg (см. ниже)
  const style = document.createElement('style');
  style.innerHTML = `
    @supports (-webkit-touch-callout: none){
      .hero::before{ transform: translate3d(0, var(--ios-bg-shift, 0px), 0) !important; }
    }
  `;
  document.head.appendChild(style);

  apply();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(apply));
})();

