(() => {
    'use strict';

    /* ========== ВСПОМОГАЮЩЕЕ: загрузка скриптов один раз ========== */
    const loadScriptOnce = (src) =>
        new Promise((resolve, reject) => {
            if (document.querySelector(`script[data-dyn="${src}"]`)) return resolve();
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.dataset.dyn = src;
            s.onload = resolve;
            s.onerror = () => reject(new Error('Не удалось загрузить: ' + src));
            document.head.appendChild(s);
        });

    const prefersReduce = () =>
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ========== Навигация: hover/focus подсветка ========== */
    const toggleHover = (e, on) => {
        const a = e.target.closest('.main-nav a');
        if (a) a.classList.toggle('hover', on);
    };
    document.addEventListener('mouseover', (e) => toggleHover(e, true));
    document.addEventListener('mouseout',  (e) => toggleHover(e, false));
    document.addEventListener('focusin',   (e) => toggleHover(e, true));
    document.addEventListener('focusout',  (e) => toggleHover(e, false));

    /* ========== Подсветка активного пункта по URL ========== */
    document.addEventListener('DOMContentLoaded', () => {
        const here = location.pathname.replace(/\/+$/, '');
        document.querySelectorAll('.main-nav a').forEach((a) => {
            const linkPath = new URL(a.getAttribute('href'), location.href)
                .pathname.replace(/\/+$/, '');
            if (linkPath === here) a.classList.add('active');
        });

        const anyActive = document.querySelector('.main-nav a.active');
        const isIndex = /(?:^|\/)index\.html?$/.test(here) || here === '';
        if (!anyActive && isIndex) {
            const def = document.querySelector('.main-nav a[href*="articles.html"]');
            if (def) def.classList.add('active');
        }
    });

    /* ========== Замер времени загрузки в подвале ========== */
    const initPerfMeter = () => {
        const nav = performance.getEntriesByType('navigation')[0];
        const end = nav ? (nav.loadEventEnd || performance.now()) : performance.now();
        const ms = nav ? (end - nav.startTime) : end;
        const sec = (ms / 1000).toFixed(3);

        let footer = document.querySelector('footer');
        if (!footer) {
            footer = document.createElement('footer');
            document.body.appendChild(footer);
        }
        let meter = document.getElementById('perfInfo');
        if (!meter) {
            meter = document.createElement('p');
            meter.id = 'perfInfo';
            meter.className = 'perf-info';
            footer.appendChild(meter);
        }
        meter.innerHTML = `Время загрузки страницы: <strong>${sec}</strong> сек.`;
    };
    window.addEventListener('load', initPerfMeter);

    /* ========== Демо "случайного события" (страница Код) ========== */
    const bindDemoIfPresent = () => {
        const runBtn = document.getElementById('runDemo');
        const out = document.getElementById('demoOut');
        if (runBtn && out && !runBtn.__bound) {
            runBtn.__bound = true;
            runBtn.addEventListener('click', () => {
                let steps = 0;
                while (Math.random() > 0.1) steps++;
                out.textContent = `Событие случилось на шаге: ${steps}`;
            });
        }
    };
    document.addEventListener('DOMContentLoaded', bindDemoIfPresent);
    window.addEventListener('load', bindDemoIfPresent);

    /* ============================================================
       ЭФФЕКТ БИБЛИОТЕКОЙ ANIME.JS
       CDN: https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js
       ============================================================ */
    const ensureAnime = async () => {
        const CDN = 'https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js';
        await loadScriptOnce(CDN);
        return window.anime;
    };

    const isHomePage = () => {
        const p = location.pathname.replace(/\/+$/, '');
        return p === '' || /(?:^|\/)index\.html?$/.test(p);
    };

    // Вступительная анимация на главной
    const runHomeIntro = async () => {
        if (prefersReduce() || !isHomePage()) return;

        try {
            const anime = await ensureAnime();

            const header = document.querySelector('header.site-header');
            const navItems = document.querySelectorAll('.main-nav li');
            const logo = document.querySelector('.logo-block img');

            // стартовые состояния
            header && (header.style.opacity = '0');
            navItems.forEach(li => {
                li.style.opacity = '0';
                li.style.transform = 'translateY(-8px)';
            });
            logo && (logo.style.transformOrigin = 'center center');

            // таймлайн
            anime.timeline({ easing: 'easeOutQuad' })
                .add({
                    targets: header,
                    opacity: [0, 1],
                    duration: 400
                })
                .add({
                    targets: navItems,
                    opacity: [0, 1],
                    translateY: [-8, 0],
                    delay: anime.stagger(50),
                    duration: 350
                }, '-=150')
                .add({
                    targets: logo,
                    scale: [1, 1.08],
                    rotate: [0, 2],
                    direction: 'alternate',
                    duration: 500
                }, '-=200');
        } catch (e) {
            // если CDN недоступен — просто ничего не анимируем
        }
    };

    // Микро-анимация логотипа при клике, затем переход
    const bindLogoClickAnimation = () => {
        const link = document.querySelector('.logo-block a');
        const img  = document.querySelector('.logo-block img');
        if (!link || !img) return;
        if (link.__animeBound) return;
        link.__animeBound = true;

        link.addEventListener('click', async (e) => {
            // если юзер просит минимальную анимацию — не задерживаем переход
            if (prefersReduce()) return;

            e.preventDefault();
            const href = link.href;
            try {
                const anime = await ensureAnime();
                // маленький «pop»
                await anime({
                    targets: img,
                    scale: [{ value: 1.1, duration: 120, easing: 'easeOutQuad' },
                        { value: 1.0, duration: 150, easing: 'easeInQuad' }],
                    rotate: [{ value: 5, duration: 120 }, { value: 0, duration: 150 }],
                }).finished;
            } catch {
                // ignore
            } finally {
                location.href = href;
            }
        });

        // поддержка Enter/Space
        link.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                link.click();
            }
        });
    };

    window.addEventListener('load', () => {
        runHomeIntro();
        bindLogoClickAnimation();
    });
})();