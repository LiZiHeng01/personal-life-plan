/* 生活计划页面逻辑
   纯静态：不依赖构建工具、不使用 ES Module，双击 index.html 也能运行。 */
(() => {
  'use strict';

  const data = window.LifePlanData;
  if (!data) {
    console.error('LifePlanData 未加载');
    return;
  }

  const { names, gym, schedules, seasonOrder, seasonData, titles, photoCollections, weather } = data;
  const timeZone = 'Asia/Shanghai';
  const $ = (id) => document.getElementById(id);

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const scrollTop = () => window.scrollTo(0, 0);

  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* 本地存储不可用时静默降级 */ }
    }
  };

  const state = {
    selected: null,
    currentWeekday: null,
    currentEntry: null,
    nextEntry: null,
    photoDate: ''
  };

  const dateFormat = new Intl.DateTimeFormat('zh-CN', {
    timeZone, year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });
  const clockFormat = new Intl.DateTimeFormat('zh-CN', {
    timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  const isoFormat = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
  });

  // 按青岛气候划分：春4–5月、夏6–9月、秋10–11月、冬12–3月。
  const autoSeason = (() => {
    const month = Number(new Intl.DateTimeFormat('en-US', { timeZone, month: 'numeric' }).format(new Date()));
    if (month >= 4 && month <= 5) return 'spring';
    if (month >= 6 && month <= 9) return 'summer';
    if (month >= 10 && month <= 11) return 'autumn';
    return 'winter';
  })();

  const savedSeason = storage.get('lifeplan-season');
  let seasonChoice = savedSeason === 'auto' || seasonOrder.includes(savedSeason) ? savedSeason : 'auto';
  let season = seasonChoice === 'auto' ? autoSeason : seasonChoice;

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  /* ------------------------------------------------------------------
     日期、时间与作息
     ------------------------------------------------------------------ */

  function isoDateOf(date) {
    const parts = isoFormat.formatToParts(date);
    const get = (type) => parts.find((part) => part.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  function weekdayOf(isoDate) {
    return (new Date(isoDate + 'T00:00:00Z').getUTCDay() + 6) % 7;
  }

  function minutesOfDay(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function adjustForSeason(entries) {
    const { skin } = seasonData[season];
    return entries.map(([time, task]) => {
      let value = task;

      if (value === '起床、洗漱、简单护肤') {
        value = `起床、洗漱、${skin}`;
      }

      if (value.includes('晨间遛狗')) {
        if (season === 'winter') value = '晨间遛狗（视风力气温10–30分钟；剩余时间室内陪狗）';
        else if (season === 'summer') value = '清晨遛狗（避暑，带水；炎热时缩短）';
        else if (season === 'spring') value = '晨间遛狗（海雾或大风时缩短）';
        else if (season === 'autumn') value = '晨间遛狗（风大时缩短）';
      } else if (/^遛狗(25|30)分钟$/.test(value)) {
        if (season === 'winter') value = '晚间遛狗（照明好、避风；按气温和风力15–25分钟）';
        else if (season === 'summer') value = '晚间遛狗（避开热地面，带水）';
        else if (season === 'spring') value = '晚间遛狗（海风大时缩短）';
        else if (season === 'autumn') value = '晚间遛狗（风大时缩短）';
      } else if (/^遛狗(40|45)分钟$/.test(value)) {
        if (season === 'winter') value = '白天遛狗（按气温和风力20–40分钟）';
        else if (season === 'summer') value = '清晨遛狗（避开高温，必要时缩短）';
      }

      if (value.includes('城市探索或参加社交活动')) {
        if (season === 'winter') value = '优先白天/室内社交，寒潮或大风时减少户外停留';
        else if (season === 'summer') value = '室内社交或避暑活动；留意台风、雷雨和海雾';
        else if (season === 'spring') value = '户外或室内社交，留意海雾和大风';
        else if (season === 'autumn') value = '利用下午日光参加活动，海边注意防风';
      }

      return [time, value];
    });
  }

  function schedule(weekday) {
    const base = weekday === 5
      ? schedules.sat
      : weekday === 6
        ? schedules.sun
        : schedules.morning.concat(gym.includes(weekday) ? schedules.gymEvening : schedules.restEvening);
    return adjustForSeason(base);
  }

  function findCurrentEntry(weekday, time) {
    const now = minutesOfDay(time);
    const activeToday = schedule(weekday).find(([range]) => {
      const [from, to] = range.split('–').map(minutesOfDay);
      return now >= from && (to < from || now < to);
    });
    if (activeToday) return activeToday;

    return schedule((weekday + 6) % 7).find(([range]) => {
      const [from, to] = range.split('–').map(minutesOfDay);
      return to < from && now < to;
    }) ?? null;
  }

  function findNextEntry(weekday, time, current) {
    const now = minutesOfDay(time);
    const today = schedule(weekday);
    const currentIsToday = current && today.some(([range, task]) =>
      range === current[0] && task === current[1]);

    // 午夜后仍在继续的睡眠属于前一天，下一项是今天的第一条安排。
    if (current && !currentIsToday) {
      return { entry: today[0], tomorrow: false };
    }

    const nextToday = today.find(([range]) => minutesOfDay(range.split('–')[0]) > now);
    if (nextToday) return { entry: nextToday, tomorrow: false };

    return { entry: schedule((weekday + 1) % 7)[0], tomorrow: true };
  }

  function isKeyTask(task) {
    return /健身|遛狗|睡眠|睡觉|社交|洗澡|护肤/.test(task);
  }

  /* ------------------------------------------------------------------
     渲染
     ------------------------------------------------------------------ */

  function renderEntries(entries) {
    return entries.map(([time, task]) => {
      const isCurrent = state.selected === state.currentWeekday
        && time === state.currentEntry?.[0]
        && task === state.currentEntry?.[1];
      const classes = ['entry', isKeyTask(task) ? 'key' : '', isCurrent ? 'current' : ''].filter(Boolean).join(' ');
      const status = isCurrent ? '<span class="current-tag">进行中</span>' : '';
      return `<div class="${classes}"${isCurrent ? ' aria-current="time"' : ''}>` +
        `<div class="time">${escapeHTML(time)}</div>` +
        '<div class="rail"><div class="dot"></div></div>' +
        `<div class="task">${escapeHTML(task)}${status}</div>` +
        '</div>';
    }).join('');
  }

  function visibleSchedule(day) {
    const entries = schedule(day);
    // 午夜后还在继续的安排属于前一天，放在今天时间表的开头。
    if (day === state.currentWeekday && state.currentEntry &&
      !entries.some(([time, task]) => time === state.currentEntry[0] && task === state.currentEntry[1])) {
      return [state.currentEntry, ...entries];
    }
    return entries;
  }

  function renderWeek() {
    const selected = state.selected ?? 0;
    const dayLabels = names.map((name, index) => {
      const label = gym.includes(index) ? '健身' : index === 5 ? '外出' : index === 6 ? '恢复' : '休息';
      return `<button type="button" class="day ${gym.includes(index) ? 'gym' : ''} ${selected === index ? 'selected' : ''}" data-day="${index}" aria-pressed="${selected === index}">` +
        `<b>${escapeHTML(name.slice(1))}</b><small>${label}</small></button>`;
    }).join('');

    for (const id of ['week-overview', 'week-schedule']) {
      const container = $(id);
      if (container) container.innerHTML = dayLabels;
    }

    const isGym = gym.includes(selected);
    $('dayTitle').textContent = names[selected] + ' · ' +
      (isGym ? '健身日' : selected === 5 ? '自由外出日' : selected === 6 ? '恢复日' : '非健身日');
    $('dayDesc').textContent = isGym
      ? '训练内容由你自己决定'
      : selected === 5
        ? '留给外出、兴趣和社交活动'
        : selected === 6
          ? '恢复、整理和自由活动'
          : '保持生活节奏，留出休息和自由空间';
    $('dayTag').textContent = isGym ? '健身' : '自由安排';

    const entries = visibleSchedule(selected);
    $('fullTimeline').innerHTML = renderEntries(entries);

    const current = state.currentWeekday === selected ? state.currentEntry : null;
    const preview = entries
      .filter(([time, task]) =>
        /遛狗|健身|洗澡|睡眠|社交/.test(task) ||
        (current && time === current[0] && task === current[1]))
      .slice(0, 5);
    $('preview').innerHTML = renderEntries(preview);
  }

  function renderPlan() {
    const label = $('planLabel');
    const task = $('planTask');

    if (state.currentEntry) {
      label.textContent = '现在 · ' + state.currentEntry[0];
      task.textContent = state.currentEntry[1];
      return;
    }

    if (state.nextEntry) {
      const [range, nextTask] = state.nextEntry.entry;
      label.textContent = '下一项 · ' + (state.nextEntry.tomorrow ? '明天 ' : '') + range.split('–')[0];
      task.textContent = nextTask;
      return;
    }

    label.textContent = '现在';
    task.textContent = '自由安排';
  }

  function renderSeason() {
    const current = seasonData[season];
    $('seasonTitle').textContent = '青岛 · ' + current.name + '生活建议';
    $('seasonSubtitle').textContent = current.desc + (seasonChoice === 'auto' ? ' · 按青岛气候自动识别' : ' · 手动预览');

    const autoButton = `<button type="button" data-season="auto" aria-pressed="${seasonChoice === 'auto'}" class="${seasonChoice === 'auto' ? 'active' : ''}">自动</button>`;
    const seasonButtons = seasonOrder.map((key) =>
      `<button type="button" data-season="${key}" aria-pressed="${seasonChoice === key}" class="${seasonChoice === key ? 'active' : ''}">${escapeHTML(seasonData[key].name)}</button>`
    ).join('');
    $('seasonSwitch').innerHTML = autoButton + seasonButtons;

    $('seasonTips').innerHTML = [
      ['🐶', '遛狗', current.walk],
      ['🏋', '健身与饮食', current.gym],
      ['👥', '社交与周末', current.social]
    ].map(([icon, label, text]) =>
      `<div class="season-tip"><b>${icon} ${escapeHTML(label)}</b><p>${escapeHTML(text)}</p></div>`
    ).join('');

    $('scheduleSeason').textContent = '青岛' + current.name + '作息提示：' + current.walk;
  }

  /* ------------------------------------------------------------------
     青岛天气
     ------------------------------------------------------------------ */

  function renderWeatherSource() {
    if (!weather) return;
    const city = $('weatherCity');
    const source = $('weatherSource');
    if (city) city.textContent = weather.city;
    if (source) {
      source.href = weather.sourceUrl;
      source.textContent = weather.sourceName || '天气来源';
    }
  }

  async function refreshWeather() {
    const target = $('localWeather');
    if (!target) return;
    if (!weather) {
      target.textContent = '天气暂不可用';
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(weather.url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('天气服务不可用');
      const current = await response.json();
      if (String(current.adcode) !== String(weather.adcode)) throw new Error('城市数据不匹配');

      const temperature = Number(current.temperature);
      if (!Number.isFinite(temperature) || typeof current.weather !== 'string' || !current.weather.trim()) {
        throw new Error('天气数据不完整');
      }

      const details = [current.weather.trim() + ' ' + Math.round(temperature) + '°C'];
      if (current.wind_direction && current.wind_power) {
        const power = String(current.wind_power).replace(/级$/, '');
        details.push(current.wind_direction + ' ' + power + '级');
      }
      const humidity = Number(current.humidity);
      if (Number.isFinite(humidity)) details.push('湿度 ' + Math.round(humidity) + '%');

      target.textContent = details.join(' · ');
      target.title = current.report_time ? '更新时间 ' + current.report_time : '';
    } catch {
      target.textContent = '天气暂不可用';
      target.title = '';
    } finally {
      clearTimeout(timeout);
    }
  }

  function renderPhotos(isoDate) {
    if (state.photoDate === isoDate) return;
    state.photoDate = isoDate;
    const day = Math.floor(Date.parse(isoDate + 'T00:00:00Z') / 86400000);
    document.querySelectorAll('.court-photo').forEach((card, index) => {
      const collection = photoCollections[index];
      const image = card.querySelector('img');
      if (!collection || !image) return;

      const show = (attempt) => {
        const photo = collection.photos[(day + attempt) % collection.photos.length];
        card.href = photo.source;
        card.setAttribute('aria-label', photo.credit + '，查看来源');
        card.classList.remove('missing');
        image.hidden = false;
        image.alt = photo.credit;
        image.onerror = () => {
          if (attempt + 1 < collection.photos.length) {
            show(attempt + 1);
          } else {
            image.hidden = true;
            card.classList.add('missing');
          }
        };
        image.src = photo.src;
      };

      show(0);
    });
  }

  function renderPhotoCredits() {
    const list = $('photoCreditsList');
    if (!list) return;
    list.innerHTML = photoCollections.flatMap((collection) =>
      collection.photos.map((photo) =>
        `<li><a href="${escapeHTML(photo.source)}" target="_blank" rel="noopener noreferrer">${escapeHTML(photo.credit)}</a>` +
        `<span class="license">${escapeHTML(photo.license)}</span></li>`
      )
    ).join('');
  }

  function renderClock(force = false) {
    const now = new Date();
    const isoDate = isoDateOf(now);
    const clock = clockFormat.format(now);

    $('todayDate').textContent = dateFormat.format(now);
    $('todayDate').dateTime = isoDate;
    $('localClock').textContent = clock;
    $('localClock').dateTime = clock;
    renderPhotos(isoDate);

    const weekday = weekdayOf(isoDate);
    const entry = findCurrentEntry(weekday, clock);
    const next = findNextEntry(weekday, clock, entry);
    const changed = force
      || weekday !== state.currentWeekday
      || entry?.[0] !== state.currentEntry?.[0]
      || entry?.[1] !== state.currentEntry?.[1]
      || next?.entry?.[0] !== state.nextEntry?.entry?.[0]
      || next?.entry?.[1] !== state.nextEntry?.entry?.[1]
      || next?.tomorrow !== state.nextEntry?.tomorrow;

    if (weekday !== state.currentWeekday) {
      if (state.selected === null || state.selected === state.currentWeekday) state.selected = weekday;
      state.currentWeekday = weekday;
    }
    if (state.selected === null) state.selected = weekday;

    if (changed) {
      state.currentEntry = entry;
      state.nextEntry = next;
      renderWeek();
      renderPlan();
    }
  }

  /* ------------------------------------------------------------------
     页面导航、选日、季节与主题
     ------------------------------------------------------------------ */

  const pageIds = Object.keys(titles);

  function go(pageId, push = true) {
    const id = pageIds.includes(pageId) ? pageId : 'overview';
    document.querySelectorAll('.page').forEach((section) => {
      section.classList.toggle('active', section.id === 'page-' + id);
    });
    document.querySelectorAll('[data-page]').forEach((button) => {
      const active = button.dataset.page === id;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });

    const [title, desc] = titles[id] || titles.overview;
    $('pagetitle').textContent = title;
    $('pagedesc').textContent = desc;
    document.title = title + ' · 青岛生活计划';

    if (push && location.hash.slice(1) !== id) {
      try {
        history.pushState(null, '', '#' + id);
      } catch {
        location.hash = id;
      }
    }
    // 浏览器会为 #section 做原生锚点滚动，等这一帧结束后再回到页首。
    requestAnimationFrame(scrollTop);
  }

  function pick(index) {
    if (!Number.isInteger(index) || index < 0 || index >= names.length) return;
    state.selected = index;
    renderWeek();
  }

  function setSeason(choice) {
    if (choice !== 'auto' && !seasonOrder.includes(choice)) return;
    seasonChoice = choice;
    season = choice === 'auto' ? autoSeason : choice;
    storage.set('lifeplan-season', choice);
    renderSeason();
    renderClock(true);
  }

  const themeButton = $('theme');
  function applyTheme(dark, persist) {
    document.body.classList.toggle('dark', dark);
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.title = dark ? '切换浅色模式' : '切换深色模式';
    if (persist) storage.set('lifeplan-theme', dark ? 'dark' : 'light');
  }

  const savedTheme = storage.get('lifeplan-theme');
  const prefersDark = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
  applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark, false);
  themeButton.addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('dark'), true);
  });

  document.addEventListener('click', (event) => {
    const dayButton = event.target.closest('[data-day]');
    if (dayButton) {
      pick(Number(dayButton.dataset.day));
      return;
    }

    const seasonButton = event.target.closest('[data-season]');
    if (seasonButton) {
      setSeason(seasonButton.dataset.season);
      return;
    }

    const pageButton = event.target.closest('[data-page]');
    if (pageButton) {
      go(pageButton.dataset.page);
      return;
    }

    const action = event.target.closest('[data-action]');
    if (!action) return;
    if (action.dataset.action === 'today') {
      if (state.currentWeekday !== null) pick(state.currentWeekday);
      go('schedule');
    } else if (action.dataset.action === 'go') {
      go(action.dataset.target);
    }
  });

  window.addEventListener('hashchange', () => {
    go(location.hash.slice(1), false);
    // 某些浏览器会在 hashchange 之后才执行原生锚点滚动。
    setTimeout(scrollTop, 80);
  });

  window.addEventListener('load', () => {
    setTimeout(scrollTop, 0);
  });

  /* ------------------------------------------------------------------
     启动
     ------------------------------------------------------------------ */

  renderSeason();
  renderPhotoCredits();
  renderWeatherSource();
  renderClock(true);
  go(location.hash.slice(1), false);
  refreshWeather();
  setInterval(() => renderClock(), 10000);
  setInterval(refreshWeather, 15 * 60 * 1000);
})();
