/* 实时天光
   背景画布按青岛当前时间在晨昏之间过渡，并按天气画雨、雪、雾、风。
   纯 Canvas 2D，无依赖；prefers-reduced-motion 下只画静态一帧。 */
(() => {
  'use strict';

  const canvas = document.getElementById('sky');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* 一天中的光：每条锚点 = 小时 + 上/中/下三段颜色 + 是否属于"暗色" + 星点密度 */
  const SKY = [
    { h: 0, c: ['#04060d', '#09101f', '#0f172c'], dark: true, star: 1 },
    { h: 4.4, c: ['#070b18', '#141c33', '#243053'], dark: true, star: 0.75 },
    { h: 5.8, c: ['#202a4d', '#5f4a6b', '#c98a68'], dark: true, star: 0.25 },
    { h: 7.2, c: ['#9fb7cd', '#dcd4c3', '#f1e6d3'], dark: false, star: 0 },
    { h: 11, c: ['#c6dbee', '#ece8dc', '#f6f1e4'], dark: false, star: 0 },
    { h: 15, c: ['#dfd9c6', '#f0dcbe', '#f3e6cf'], dark: false, star: 0 },
    { h: 17.2, c: ['#c69a80', '#cf8f74', '#a96a63'], dark: false, star: 0 },
    { h: 18.4, c: ['#5a4763', '#7d5364', '#4b3550'], dark: true, star: 0.3 },
    { h: 20, c: ['#0d1428', '#161f38', '#1e2a48'], dark: true, star: 0.8 },
    { h: 24, c: ['#04060d', '#09101f', '#0f172c'], dark: true, star: 1 }
  ];

  const state = {
    hour: 12,
    theme: 'auto',
    kind: 'clear',
    wind: 0,
    dark: false
  };

  let w = 0;
  let h = 0;
  let dpr = 1;
  let particles = [];
  let stars = [];
  let rafId = 0;
  let lastTime = 0;
  let dirty = true;
  const pointer = { x: 0, y: 0, px: -999, py: -999, over: false };

  window.addEventListener('pointermove', (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    pointer.px = event.clientX;
    pointer.py = event.clientY;
    pointer.over = true;
  }, { passive: true });

  window.addEventListener('pointerleave', () => { pointer.over = false; }, { passive: true });

  /* 指针经过时把雨丝、雪片、尘点搅开一点 */
  function stir(p, dt) {
    if (!pointer.over) return;
    const dx = p.x - pointer.px;
    const dy = p.y - pointer.py;
    const dist2 = dx * dx + dy * dy;
    const radius = 160;
    if (dist2 > radius * radius) return;
    const dist = Math.sqrt(dist2) || 1;
    const push = (1 - dist / radius) * dt * 0.5;
    p.x += (dx / dist) * push;
    p.y += (dy / dist) * push;
  }

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  function toRgb(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  }

  function mix(c1, c2, t) {
    const a = toRgb(c1);
    const b = toRgb(c2);
    const k = clamp(t, 0, 1);
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * k) + ',' +
      Math.round(a[1] + (b[1] - a[1]) * k) + ',' +
      Math.round(a[2] + (b[2] - a[2]) * k) + ')';
  }

  /* 用天空上部的亮度决定界面要不要转成暗色，避免出现"暗天空 + 黑字" */
  function isDarkColor(rgbText) {
    const parts = rgbText.match(/\d+/g);
    if (!parts) return false;
    const l = (0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2]) / 255;
    return l < 0.46;
  }

  /* 取出当前小时的调色板；forced 为 light/dark 时用来强制白天或夜晚 */
  function paletteFor(hour, forced) {
    if (forced === 'dark') return spread(SKY[0]);
    if (forced === 'light') return spread(SKY[4]);

    const value = ((hour % 24) + 24) % 24;
    for (let i = 0; i < SKY.length - 1; i += 1) {
      const a = SKY[i];
      const b = SKY[i + 1];
      if (value >= a.h && value <= b.h) {
        const t = (value - a.h) / (b.h - a.h || 1);
        const colors = [mix(a.c[0], b.c[0], t), mix(a.c[1], b.c[1], t), mix(a.c[2], b.c[2], t)];
        return {
          c: colors,
          dark: isDarkColor(colors[0]) || isDarkColor(colors[1]),
          star: a.star + (b.star - a.star) * t
        };
      }
    }
    return spread(SKY[0]);
  }

  function spread(anchor) {
    return { c: anchor.c.slice(), dark: anchor.dark, star: anchor.star };
  }

  /* 太阳/月亮在天上的位置：固定在上半屏右侧，避开左侧的巨型时钟 */
  function bodyPosition(dark) {
    const start = dark ? 18.6 : 6.2;
    const len = dark ? 11.6 : 12.4;
    let p = (((state.hour - start) % 24) + 24) % 24 / len;
    p = clamp(p, 0, 1);
    return {
      x: w * (0.52 + 0.38 * p),
      y: h * (0.34 - 0.26 * Math.sin(Math.PI * p)),
      p
    };
  }

  function kindOf(text, wind) {
    const t = String(text || '');
    if (/台风/.test(t)) return 'wind';
    if (/雷/.test(t)) return 'rain';
    if (/雨/.test(t)) return 'rain';
    if (/雪/.test(t)) return 'snow';
    if (/雾|霾|沙|尘/.test(t)) return 'fog';
    if (wind >= 6) return 'wind';
    return 'clear';
  }

  function spawn() {
    const n = state.kind === 'rain' ? 120
      : state.kind === 'snow' ? 90
        : state.kind === 'wind' ? 24
          : state.kind === 'fog' ? 7
            : 46;

    particles = Array.from({ length: n }, () => makeParticle());
  }

  function makeParticle() {
    switch (state.kind) {
      case 'rain':
        return { x: rand(0, w), y: rand(-h, h), len: rand(14, 40), v: rand(620, 1100), a: rand(0.12, 0.34) };
      case 'snow':
        return { x: rand(0, w), y: rand(-h, h), r: rand(1.2, 3.4), v: rand(26, 70), drift: rand(-18, 18), a: rand(0.35, 0.8) };
      case 'wind':
        return { x: rand(0, w), y: rand(0, h), len: rand(90, 300), v: rand(240, 520), a: rand(0.04, 0.13), bend: rand(-24, 24) };
      case 'fog':
        return { x: rand(0, w), y: rand(h * 0.4, h * 1.05), r: rand(h * 0.18, h * 0.42), v: rand(6, 16), a: rand(0.05, 0.13) };
      default:
        return { x: rand(0, w), y: rand(0, h), r: rand(0.8, 2.2), v: rand(6, 22), drift: rand(4, 16), a: rand(0.1, 0.32) };
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = Array.from({ length: 90 }, () => ({
      x: rand(0, w),
      y: rand(0, h * 0.75),
      r: rand(0.5, 1.5),
      a: rand(0.25, 0.9)
    }));
    spawn();
    dirty = true;
  }

  function drawStars(palette) {
    if (palette.star <= 0.02) return;
    ctx.save();
    ctx.translate(pointer.x * -14, pointer.y * -10);
    for (const s of stars) {
      ctx.globalAlpha = s.a * palette.star * (state.dark ? 1 : 0.15);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawBody(palette) {
    const pos = bodyPosition(palette.dark);
    // 光斑跟着指针轻微移动，背景就有了纵深
    const cx = pos.x + pointer.x * 26;
    const cy = pos.y + pointer.y * 18;

    // 外圈弥散光
    const glowRadius = Math.min(w, h) * (palette.dark ? 0.36 : 0.5);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
    glow.addColorStop(0, palette.dark ? 'rgba(198, 214, 255, .34)' : 'rgba(255, 236, 198, .70)');
    glow.addColorStop(0.3, palette.dark ? 'rgba(150, 178, 240, .16)' : 'rgba(255, 214, 150, .28)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // 太阳 / 月亮本体
    const disc = Math.min(w, h) * (palette.dark ? 0.03 : 0.034);
    ctx.beginPath();
    ctx.arc(cx, cy, disc, 0, Math.PI * 2);
    ctx.fillStyle = palette.dark ? 'rgba(247, 248, 236, .97)' : 'rgba(255, 246, 214, .98)';
    ctx.fill();

    // 月亮的暗面与光环，让它看起来是个球体
    if (palette.dark) {
      ctx.beginPath();
      ctx.arc(cx - disc * 0.3, cy + disc * 0.16, disc * 0.84, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(224, 229, 222, .55)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, disc * 1.6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(230, 238, 255, .18)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // 太阳的一圈热浪
      ctx.beginPath();
      ctx.arc(cx, cy, disc * 1.28, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 226, 170, .5)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }

  function stepAndDrawParticles(dt) {
    const windPush = state.wind * 6;
    for (const p of particles) stir(p, dt);
    ctx.save();

    if (state.kind === 'rain') {
      ctx.strokeStyle = 'rgba(210, 228, 245, 0.9)';
      ctx.lineWidth = 1.1;
      for (const p of particles) {
        p.y += (p.v * dt) / 1000;
        p.x -= (windPush * dt) / 1000;
        if (p.y > h + 40 || p.x < -40) {
          p.y = -40;
          p.x = rand(-40, w + 80);
        }
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.len * 0.12, p.y + p.len);
        ctx.stroke();
      }
    } else if (state.kind === 'snow') {
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      for (const p of particles) {
        p.y += (p.v * dt) / 1000;
        p.x += ((p.drift + windPush * 0.4) * dt) / 1000;
        if (p.y > h + 20) { p.y = -20; p.x = rand(0, w); }
        if (p.x > w + 20) p.x = -20;
        if (p.x < -20) p.x = w + 20;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (state.kind === 'wind') {
      ctx.lineCap = 'round';
      for (const p of particles) {
        p.x += ((p.v + windPush * 12) * dt) / 1000;
        if (p.x - p.len > w) { p.x = -p.len; p.y = rand(0, h); }
        ctx.globalAlpha = p.a;
        ctx.strokeStyle = state.dark ? 'rgba(220,232,255,0.9)' : 'rgba(255,255,255,0.9)';
        ctx.lineWidth = rand(0.8, 1.4);
        ctx.beginPath();
        ctx.moveTo(p.x - p.len, p.y);
        ctx.quadraticCurveTo(p.x - p.len / 2, p.y + p.bend, p.x, p.y);
        ctx.stroke();
      }
    } else if (state.kind === 'fog') {
      for (const p of particles) {
        p.x += (p.v * dt) / 1000;
        if (p.x - p.r > w) p.x = -p.r;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, 'rgba(255,255,255,' + p.a + ')');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = state.dark ? 'rgba(220,225,255,0.9)' : 'rgba(255,255,255,0.95)';
      for (const p of particles) {
        p.y -= (p.v * dt) / 1000;
        p.x += ((p.drift * 0.4 + windPush * 0.2) * dt) / 1000;
        if (p.y < -10) { p.y = h + 10; p.x = rand(0, w); }
        if (p.x > w + 10) p.x = -10;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function render() {
    const palette = paletteFor(state.hour, state.theme === 'auto' ? null : state.theme);
    state.dark = palette.dark;

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, palette.c[0]);
    sky.addColorStop(0.52, palette.c[1]);
    sky.addColorStop(1, palette.c[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    drawStars(palette);
    drawBody(palette);
  }

  function frame(time) {
    const dt = Math.min(48, time - lastTime || 16);
    lastTime = time;
    render();
    stepAndDrawParticles(dt);
    rafId = window.requestAnimationFrame(frame);
  }

  function start() {
    if (reduceMotion || running()) return;
    lastTime = 0;
    rafId = window.requestAnimationFrame(frame);
  }

  function stop() {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function running() {
    return rafId !== 0;
  }

  function paintOnce() {
    render();
    stepAndDrawParticles(0);
  }

  function sync() {
    stop();
    if (reduceMotion) {
      paintOnce();
    } else if (!document.hidden) {
      start();
    }
  }

  window.addEventListener('resize', () => {
    resize();
    sync();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else sync();
  });

  const api = {
    /* 是否属于需要暗色主题的时段 */
    isDark(hour) {
      return paletteFor(hour, null).dark;
    },
    update(next) {
      if (typeof next.hour === 'number') state.hour = next.hour;
      if (typeof next.theme === 'string') state.theme = next.theme;
      let refreshParticles = false;
      if (typeof next.weatherText === 'string' || typeof next.wind === 'number') {
        if (typeof next.wind === 'number') state.wind = next.wind;
        const kind = kindOf(next.weatherText, state.wind);
        if (kind !== state.kind) {
          state.kind = kind;
          refreshParticles = true;
        }
      }
      if (!w) resize();
      if (refreshParticles) spawn();
      if (reduceMotion) paintOnce();
      else if (!running()) start();
      dirty = false;
    }
  };

  window.LifePlanSky = api;
  resize();
  api.update({ hour: state.hour });
  sync();

  // 天光每 10 分钟重算一次（浏览器长时间挂着也能跟着走）
  window.setInterval(() => {
    if (!window.LifePlanSky) return;
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).format(now).split(':');
    api.update({ hour: Number(parts[0]) + Number(parts[1]) / 60 });
  }, 600000);
})();
