/* 交互层
   指针跟随的光斑、卡片 3D 倾斜、磁吸元素、滚动进度、标题逐字入场。
   所有效果都在 prefers-reduced-motion 或触屏环境下自动关闭。 */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  const finePointer = window.matchMedia
    ? window.matchMedia('(pointer: fine)').matches
    : false;

  const root = document.documentElement;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------------------------------------------------------- 滚动进度条 */

  const rail = document.getElementById('scrollProgress');
  let scrollQueued = false;

  function paintScroll() {
    scrollQueued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    if (rail) rail.style.transform = 'scaleX(' + ratio + ')';
    root.style.setProperty('--scroll', String(ratio));

    // 首屏跟着滚动轻微上浮并淡出，做出层次
    const heroGrid = document.querySelector('.hero-grid');
    if (heroGrid && !reduceMotion) {
      const shift = Math.min(window.scrollY * 0.18, 90);
      const fade = clamp(1 - window.scrollY / 620, 0.15, 1);
      heroGrid.style.setProperty('--hs', shift + 'px');
      heroGrid.style.opacity = String(fade);
    }
  }

  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(paintScroll);
  }, { passive: true });

  paintScroll();

  /* ------------------------------------------------------ 指针光斑与视差 */

  const glow = document.getElementById('cursorGlow');
  let pointerX = window.innerWidth * 0.68;
  let pointerY = window.innerHeight * 0.22;
  let pointerQueued = false;

  function paintPointer() {
    pointerQueued = false;
    const nx = pointerX / window.innerWidth - 0.5;
    const ny = pointerY / window.innerHeight - 0.5;

    if (glow) {
      glow.style.setProperty('--gx', pointerX + 'px');
      glow.style.setProperty('--gy', pointerY + 'px');
      glow.style.opacity = '1';
    }

    const hero = document.querySelector('.hero');
    if (hero && finePointer && !reduceMotion) {
      hero.style.setProperty('--hx', (nx * -14).toFixed(1) + 'px');
      hero.style.setProperty('--hy', (ny * -8).toFixed(1) + 'px');
    }

    document.querySelectorAll('.card').forEach((card) => {
      if (!card.classList.contains('tilting')) {
        card.style.setProperty('--px', (nx * 6).toFixed(1) + 'px');
        card.style.setProperty('--py', (ny * 6).toFixed(1) + 'px');
      }
    });
  }

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (pointerQueued) return;
    pointerQueued = true;
    window.requestAnimationFrame(paintPointer);
  }, { passive: true });

  if (finePointer && !reduceMotion) {
    // 首次移动前先点亮一次
    window.requestAnimationFrame(paintPointer);

    /* ------------------------------------------------------ 卡片 3D 倾斜 */

    const TILT = 3.2;

    document.addEventListener('pointermove', (event) => {
      const card = event.target.closest ? event.target.closest('.card') : null;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.classList.add('tilting');
      card.style.transform =
        'perspective(900px) rotateX(' + (-y * TILT).toFixed(2) + 'deg) rotateY(' +
        (x * TILT).toFixed(2) + 'deg) translateZ(0)';
    });

    document.addEventListener('pointerout', (event) => {
      const card = event.target.closest ? event.target.closest('.card') : null;
      if (!card) return;
      if (event.relatedTarget && card.contains(event.relatedTarget)) return;
      card.classList.remove('tilting');
      card.style.transform = '';
    });

    /* --------------------------------------------------------- 磁吸按钮 */

    document.querySelectorAll('.nav-link, .theme-btn, .text-link').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        element.style.transform =
          'translate(' + (dx * 0.12).toFixed(1) + 'px,' + (dy * 0.18).toFixed(1) + 'px)';
      });
      element.addEventListener('pointerleave', () => {
        element.style.transform = '';
      });
    });
  }

  /* --------------------------------------------------------- 标题入场 */

  function revealTitle() {
    const title = document.getElementById('pagetitle');
    if (!title || reduceMotion) return;
    const text = title.textContent || '';
    const already = title.dataset.split === text && title.querySelector('.char');
    if (already) return;
    title.dataset.split = text;
    title.setAttribute('aria-label', text);
    title.textContent = '';
    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = char === ' ' ? '\u00a0' : char;
      span.style.animationDelay = 40 + index * 26 + 'ms';
      title.appendChild(span);
    });
  }

  document.addEventListener('lifeplan:page', () => {
    window.requestAnimationFrame(() => {
      revealTitle();
      paintScroll();
    });
  });

  /* --------------------------------------------------------- 时钟跳动 */

  const clock = document.getElementById('localClock');
  if (clock && !reduceMotion) {
    let last = clock.textContent;
    const observer = new MutationObserver(() => {
      if (clock.textContent === last) return;
      last = clock.textContent;
      clock.classList.remove('tick');
      void clock.offsetWidth;
      clock.classList.add('tick');
    });
    observer.observe(clock, { childList: true, characterData: true, subtree: true });
  }

  revealTitle();

  /* --------------------------------------------------- 时间穿越（拖动天色） */

  const hero = document.querySelector('.hero');
  const travel = document.getElementById('timetravel');
  const travelTime = document.getElementById('timetravelTime');
  const travelPhase = document.getElementById('timetravelPhase');
  const clockEl = document.getElementById('localClock');

  const PHASES = [
    [5, '深夜'], [7, '清晨'], [11, '上午'], [13, '正午'],
    [17, '下午'], [19, '黄昏'], [23, '夜晚'], [24, '深夜']
  ];

  function phaseOf(hour) {
    for (const [until, name] of PHASES) {
      if (hour < until) return name;
    }
    return '深夜';
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  let scrubbing = false;
  let returnTimer = 0;
  let travelX = 0;
  let travelY = 0;

  function paintTravel() {
    if (!travel) return;
    travel.style.transform = 'translate(' + travelX + 'px,' + travelY + 'px)';
  }

  function applyHour(hour) {
    if (!window.LifePlanSky) return;
    window.LifePlanSky.update({ hour, theme: 'auto' });
    root.classList.toggle('dark', window.LifePlanSky.isDark(hour));
    const total = Math.round(hour * 60) % 1440;
    const hh = pad(Math.floor(total / 60));
    const mm = pad(total % 60);
    if (travelTime) travelTime.textContent = hh + ':' + mm;
    if (travelPhase) travelPhase.textContent = phaseOf(hour);
    if (clockEl) {
      clockEl.textContent = hh + ':' + mm;
      clockEl.classList.add('scrubbing');
    }
  }

  function beginScrub(event) {
    if (!finePointer || reduceMotion || !hero) return;
    if (event.target.closest('a, button, .now, .card, .credits')) return;
    scrubbing = true;
    window.clearTimeout(returnTimer);
    root.dataset.scrubbing = '1';
    if (travel) travel.classList.add('on');
    updateScrub(event);
  }

  function updateScrub(event) {
    if (!scrubbing) return;
    const ratio = clamp(event.clientX / window.innerWidth, 0, 1);
    travelX = event.clientX;
    travelY = event.clientY - 54;
    paintTravel();
    applyHour(ratio * 24);
  }

  function endScrub() {
    if (!scrubbing) return;
    scrubbing = false;
    if (travel) travel.classList.remove('on');
    returnTimer = window.setTimeout(() => {
      root.dataset.scrubbing = '';
      if (clockEl) clockEl.classList.remove('scrubbing');
      if (window.LifePlanApp) {
        window.LifePlanApp.applyTheme(window.LifePlanApp.themeMode());
        window.LifePlanApp.refresh();
      }
    }, 700);
  }

  if (hero) {
    hero.addEventListener('pointerdown', beginScrub);
    window.addEventListener('pointermove', updateScrub, { passive: true });
    window.addEventListener('pointerup', endScrub);
    window.addEventListener('pointercancel', endScrub);
  }
})();
