/* 生活计划页面逻辑
   纯静态：不依赖构建工具、不使用 ES Module，双击 index.html 也能运行。 */
(() => {
  'use strict';

  const data = window.LifePlanData;
  if (!data) {
    console.error('LifePlanData 未加载');
    return;
  }

  const { names, gym, schedules, seasonOrder, seasonData, titles, photoCollections, weather, mealIdeas, market, training } = data;
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
      ? '今天练什么，去「训练」页看动作表'
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
    const previewBox = $('preview');
    if (previewBox) previewBox.innerHTML = renderEntries(preview);
    renderTodayTraining(selected);
  }

  /* ------------------------------------------------------------------
     饮食、训练与照片墙
     ------------------------------------------------------------------ */

  function renderTodayMeals(weekday) {
    const list = $('todayMeals');
    if (!list || !mealIdeas) return;
    const pick = (arr, offset) =>
      Array.isArray(arr) && arr.length ? arr[(weekday + offset) % arr.length] : '';
    const rows = [
      ['早', pick(mealIdeas.breakfast, 0)],
      ['午', pick(mealIdeas.lunch, 1)],
      ['晚', pick(mealIdeas.dinner, 2)]
    ];
    list.innerHTML = rows.map(([key, value]) =>
      `<li class="today-meal"><span>${escapeHTML(key)}</span><b>${escapeHTML(value)}</b></li>`
    ).join('');
  }

  function renderMarket() {
    const put = (id, rows) => {
      const box = $(id);
      if (!box || !Array.isArray(rows)) return;
      box.innerHTML = rows.map(([name, qty]) =>
        `<li><b>${escapeHTML(name)}</b><i class="qty">${escapeHTML(qty)}</i></li>`
      ).join('');
    };
    if (market) {
      put('buyFruit', market.fruit);
      put('buyVeg', market.veg);
    }
  }

  function renderTraining() {
    const note = $('trainNote');
    if (note) note.textContent = training?.note || '';

    const grid = $('trainDays');
    if (grid && Array.isArray(training?.days)) {
      grid.innerHTML = training.days.map((day) => {
        const items = Array.isArray(day.items) && day.items.length
          ? day.items.map((item) =>
            `<li>${escapeHTML(item)}</li>`
          ).join('')
          : '<li class="ph">动作待补充</li><li class="ph">动作待补充</li><li class="ph">动作待补充</li>';
        return `<article class="card step">` +
          `<span class="tag">${escapeHTML(day.key)} 日</span>` +
          `<h3>${escapeHTML(day.name)} · ${escapeHTML(day.hint)}</h3>` +
          `<ul class="train-items">${items}</ul>` +
          '</article>';
      }).join('');
    }
    renderTodayTraining(state.selected);
  }

  function renderTodayTraining(day) {
    const box = $('todayTraining');
    if (!box || !Array.isArray(training?.days)) return;
    const plan = training.days.find((item) => item.weekday === day);
    if (plan) {
      const filled = Array.isArray(plan.items) && plan.items.length > 0;
      box.innerHTML =
        `<p class="today-train-key">${escapeHTML(plan.key)} · ${escapeHTML(plan.name)}</p>` +
        `<p class="today-train-hint">${escapeHTML(plan.hint)}</p>` +
        `<p class="note">${filled ? '动作表已填，去「训练」页看。' : '动作表待补充，先去「训练」页把位置占好。'}</p>`;
      return;
    }
    box.innerHTML =
      '<p class="today-train-key">休息</p>' +
      '<p class="today-train-hint">今天不练力量。</p>' +
      '<p class="note">走路、骑车和遛狗照常，就是今天的活动量。</p>';
  }

  const allPhotos = photoCollections.flatMap((collection) =>
    collection.photos.map((photo) => ({ ...photo, collection: collection.label }))
  );

  function renderPhotos(isoDate) {
    const box = $('photoGallery');
    if (!box || !allPhotos.length) return;
    if (state.photoDate === isoDate && box.childElementCount) return;
    state.photoDate = isoDate;

    const day = Math.floor(Date.parse(isoDate + 'T00:00:00Z') / 86400000);
    const count = Math.min(8, allPhotos.length);
    const start = (day * 2) % allPhotos.length;
    const picks = [];
    for (let i = 0; i < count; i += 1) picks.push(allPhotos[(start + i) % allPhotos.length]);

    box.innerHTML = picks.map((photo) =>
      `<a class="gallery-item" href="${escapeHTML(photo.source)}" ` +
      `target="_blank" rel="noopener noreferrer" title="${escapeHTML(photo.collection + ' · ' + photo.credit)}">` +
      `<img src="${escapeHTML(photo.src)}" alt="${escapeHTML(photo.credit)}" loading="lazy" decoding="async">` +
      '</a>'
    ).join('');
  }

  function humanMinutes(total) {
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    if (hours && minutes) return hours + ' 小时 ' + minutes + ' 分';
    if (hours) return hours + ' 小时';
    return Math.max(0, minutes) + ' 分';
  }

  function renderPlanProgress(entry) {
    const bar = $('planProgress');
    const left = $('planLeft');
    if (!bar || !left) return;

    if (!entry) {
      bar.style.width = '0%';
      left.textContent = '';
      return;
    }

    const [from, to] = entry[0].split('–').map(minutesOfDay);
    const now = minutesOfDay(clockFormat.format(new Date()));
    let span = to - from;
    let elapsed = now - from;
    if (span <= 0) span += 1440;
    if (elapsed < 0) elapsed += 1440;

    const percent = Math.min(100, Math.max(0, Math.round((elapsed / span) * 100)));
    bar.style.width = percent + '%';
    left.textContent = elapsed >= span ? '即将结束' : '还剩 ' + humanMinutes(span - elapsed);
  }

  function renderPlan() {
    const label = $('planLabel');
    const task = $('planTask');

    if (state.currentEntry) {
      label.textContent = '现在 · ' + state.currentEntry[0];
      task.textContent = state.currentEntry[1];
      renderPlanProgress(state.currentEntry);
      return;
    }

    if (state.nextEntry) {
      const [range, nextTask] = state.nextEntry.entry;
      const startText = range.split('–')[0];
      label.textContent = '下一项 · ' + (state.nextEntry.tomorrow ? '明天 ' : '') + startText;
      task.textContent = nextTask;
      const now = minutesOfDay(clockFormat.format(new Date()));
      const wait = minutesOfDay(startText) - now;
      renderPlanProgress(null);
      const left = $('planLeft');
      if (left) left.textContent = state.nextEntry.tomorrow ? '' : '还有 ' + humanMinutes(wait);
      return;
    }

    label.textContent = '现在';
    task.textContent = '自由安排';
    renderPlanProgress(null);
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

  const WEATHER_CACHE_KEY = 'lifeplan-weather-v1';
  let weatherLoading = false;
  let weatherHasData = false;
  let weatherLastFetch = 0;
  let weatherUpdatedText = '';
  let weatherUpdatedTime = '';

  function renderWeatherSource() {
    if (!weather) return;
    const city = $('weatherCity');
    const source = $('weatherSource');
    if (city) city.textContent = weather.city;
    if (source) {
      source.href = weather.sourceUrl;
      source.textContent = weather.sourceName || '来源';
    }
  }

  function weatherIconOf(text) {
    if (/台风/.test(text)) return '🌀';
    if (/雷/.test(text)) return '⛈️';
    if (/雪|冰雹/.test(text)) return '🌨️';
    if (/雨/.test(text)) return '🌧️';
    if (/雾|霾|沙|尘/.test(text)) return '🌫️';
    if (/多云/.test(text)) return '⛅';
    if (/晴/.test(text)) return '☀️';
    if (/阴/.test(text)) return '☁️';
    return '🌤️';
  }

  function weatherTipOf(current, temperature) {
    const text = String(current.weather || '');
    if (/台风/.test(text)) return '台风天气，尽量减少外出，注意门窗安全。';
    if (/雨|雪|雷|冰雹/.test(text)) return '有降水，出门带伞，遛狗和户外活动建议缩短。';
    if (/雾|霾/.test(text)) return '能见度较低，出行注意安全。';

    const powers = String(current.wind_power || '').match(/\d+(?:\.\d+)?/g);
    const power = powers ? Math.max(...powers.map(Number)) : NaN;
    if (Number.isFinite(power) && power >= 6) return '风力较大，海边和遛狗路线注意防风。';
    if (temperature >= 30) return '气温较高，避开正午户外，注意补水。';
    if (temperature <= 0) return '气温较低，注意保暖和防风。';
    return '';
  }

  function rideTipOf(current, temperature) {
    const text = String(current.weather || '');
    if (/台风|暴雨/.test(text)) return '骑车通勤：今天有台风或暴雨，改坐公交。';
    if (/雨|雪|雷|冰雹/.test(text)) return '骑车通勤：有降水，带雨具，能坐车就坐车。';
    const powers = String(current.wind_power || '').match(/\d+(?:\.\d+)?/g);
    const power = powers ? Math.max(...powers.map(Number)) : NaN;
    if (Number.isFinite(power) && power >= 6) return '骑车通勤：风大，注意侧风，海边的路慢一点。';
    if (temperature <= 3) return '骑车通勤：气温低，多穿一件，戴手套。';
    if (temperature >= 30) return '骑车通勤：气温高，避开正午，路上补水。';
    return '骑车通勤：天气不错，照常骑，记得锁车。';
  }

  function weatherTimeOf(current, savedAt) {
    const match = String(current.report_time || '').match(/(\d{1,2}:\d{2})/);
    if (match) return match[1];
    if (savedAt) return clockFormat.format(new Date(savedAt));
    return '';
  }

  function renderWeather(current, savedAt, cached = false) {
    const target = $('localWeather');
    if (!target) return;
    const temperature = Number(current.temperature);
    const text = String(current.weather || '').trim();
    if (!Number.isFinite(temperature) || !text) return;

    target.textContent = text;
    target.title = current.report_time ? '更新时间 ' + current.report_time : '';

    const temp = $('wTemp');
    if (temp) temp.textContent = Math.round(temperature) + '°C';

    const wind = $('wWind');
    if (wind) {
      const power = String(current.wind_power || '').replace(/级$/, '');
      wind.textContent = current.wind_direction && power
        ? current.wind_direction + ' ' + power + ' 级'
        : '—';
    }

    const humidity = $('wHumidity');
    if (humidity) {
      const value = Number(current.humidity);
      humidity.textContent = Number.isFinite(value) ? Math.round(value) + '%' : '—';
    }

    const icon = $('weatherIcon');
    if (icon) icon.textContent = weatherIconOf(text);

    weatherUpdatedTime = weatherTimeOf(current, savedAt);
    weatherUpdatedText = weatherUpdatedTime
      ? (cached ? '上次更新 ' : '更新于 ') + weatherUpdatedTime
      : '';
    const updated = $('weatherUpdated');
    if (updated) updated.textContent = weatherUpdatedText;

    const tip = $('weatherTip');
    if (tip) {
      const tipText = weatherTipOf(current, temperature);
      tip.textContent = tipText;
      tip.hidden = !tipText;
    }

    const ride = $('rideTip');
    if (ride) ride.textContent = rideTipOf(current, temperature);

    // 把真实天气交给背景：雨、雪、雾、大风会画出来
    if (window.LifePlanSky) {
      const powers = String(current.wind_power || '').match(/\d+(?:\.\d+)?/g) || [];
      window.LifePlanSky.update({
        weatherText: text,
        wind: powers.length ? Math.max.apply(null, powers.map(Number)) : 0,
        hour: hourNow()
      });
    }

    weatherHasData = true;
  }

  function readWeatherCache() {
    const raw = storage.get(WEATHER_CACHE_KEY);
    if (!raw) return null;
    try {
      const cached = JSON.parse(raw);
      if (!cached || !cached.data || !cached.savedAt) return null;
      if (Date.now() - cached.savedAt > 6 * 60 * 60 * 1000) return null;
      if (!Number.isFinite(Number(cached.data.temperature)) || !String(cached.data.weather || '').trim()) return null;
      return cached;
    } catch {
      return null;
    }
  }

  async function fetchWeatherOnce() {
    if (!weather) throw new Error('天气配置缺失');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(weather.url, {
        signal: controller.signal,
        cache: 'no-store',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('天气服务不可用');
      const current = await response.json();
      if (String(current.adcode) !== String(weather.adcode)) throw new Error('城市数据不匹配');

      const temperature = Number(current.temperature);
      if (!Number.isFinite(temperature) || typeof current.weather !== 'string' || !current.weather.trim()) {
        throw new Error('天气数据不完整');
      }
      return current;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function refreshWeather() {
    const target = $('localWeather');
    if (!target) return;
    if (!weather) {
      target.textContent = '天气暂不可用';
      return;
    }
    if (weatherLoading) return;

    weatherLoading = true;
    const button = $('weatherRefresh');
    if (button) {
      button.disabled = true;
      button.textContent = '刷新中';
    }

    try {
      let current = null;
      let lastError = null;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          current = await fetchWeatherOnce();
          break;
        } catch (error) {
          lastError = error;
          if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }
      if (!current) throw lastError || new Error('天气暂不可用');

      renderWeather(current, Date.now(), false);
      storage.set(WEATHER_CACHE_KEY, JSON.stringify({ data: current, savedAt: Date.now() }));
      weatherLastFetch = Date.now();
    } catch {
      if (weatherHasData) {
        const updated = $('weatherUpdated');
        if (updated) {
          updated.textContent = weatherUpdatedTime ? '更新失败 · 上次 ' + weatherUpdatedTime : '更新失败';
        }
      } else {
        target.textContent = '天气暂不可用';
        target.title = '';
        for (const id of ['wTemp', 'wWind', 'wHumidity']) {
          const el = $(id);
          if (el) el.textContent = '—';
        }
        const updated = $('weatherUpdated');
        if (updated) updated.textContent = '点击刷新重试';
        const tip = $('weatherTip');
        if (tip) tip.hidden = true;
        const ride = $('rideTip');
        if (ride) ride.textContent = '骑车通勤：天气没取到，出门前看一眼窗外。';
      }
    } finally {
      weatherLoading = false;
      if (button) {
        button.disabled = false;
        button.textContent = '刷新';
      }
    }
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

    // 背景天光跟着时间走
    if (window.LifePlanSky) window.LifePlanSky.update({ hour: hourNow() });

    $('todayDate').textContent = dateFormat.format(now);
    $('todayDate').dateTime = isoDate;
    if (!document.documentElement.dataset.scrubbing) {
      $('localClock').textContent = clock;
      $('localClock').dateTime = clock;
    }
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
    }
    renderTodayMeals(weekday);
    // 进度条和剩余时间每 10 秒刷新一次
    renderPlan();
  }

  /* ------------------------------------------------------------------
     页面导航、选日、季节与主题
     ------------------------------------------------------------------ */

  const pageIds = Object.keys(titles);

  function go(pageId, push = true) {
    const id = pageIds.includes(pageId) ? pageId : 'today';

    const apply = () => {
      document.documentElement.dataset.page = id;
      document.querySelectorAll('.page').forEach((section) => {
        section.classList.toggle('is-active', section.id === 'page-' + id);
      });
      document.querySelectorAll('[data-page]').forEach((link) => {
        const active = link.dataset.page === id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });

      const [title, desc] = titles[id] || titles.today;
      $('pagetitle').textContent = title;
      $('pagedesc').textContent = desc;
      document.title = title + ' · 青岛生活计划';

      document.dispatchEvent(new CustomEvent('lifeplan:page', { detail: { id } }));
    };

    if (push && location.hash.slice(1) !== id) {
      try {
        history.pushState(null, '', '#' + id);
      } catch {
        location.hash = id;
      }
    }

    const reduceMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    if (typeof document.startViewTransition === 'function' && !reduceMotion) {
      document.startViewTransition(apply);
    } else {
      apply();
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

  /* ------------------------------------------------------------------
     主题：跟随天色 / 浅色 / 深色 三档循环
     ------------------------------------------------------------------ */

  const themeButton = $('theme');
  const THEME_ORDER = ['auto', 'light', 'dark'];
  const savedTheme = storage.get('lifeplan-theme');
  let themeMode = THEME_ORDER.includes(savedTheme) ? savedTheme : 'auto';

  function hourNow() {
    const [hh, mm] = clockFormat.format(new Date()).split(':');
    return Number(hh) + Number(mm) / 60;
  }

  function applyThemeMode(mode, persist) {
    themeMode = mode;
    const hour = hourNow();
    const sky = window.LifePlanSky;
    const autoDark = sky
      ? sky.isDark(hour)
      : (window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false);
    const dark = mode === 'auto' ? autoDark : mode === 'dark';

    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.dataset.theme = mode;
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.title = mode === 'auto' ? '主题：跟随天色' : (dark ? '主题：深色' : '主题：浅色');
    themeButton.setAttribute('aria-label', themeButton.title);

    if (sky) sky.update({ theme: mode, hour });
    if (persist) storage.set('lifeplan-theme', mode);
  }

  applyThemeMode(themeMode, false);

  themeButton.addEventListener('click', () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(themeMode) + 1) % THEME_ORDER.length];
    applyThemeMode(next, true);
  });

  // 给交互层（时间穿越）留的入口
  window.LifePlanApp = {
    hour: hourNow,
    themeMode: () => themeMode,
    applyTheme: (mode) => applyThemeMode(mode || themeMode, false),
    refresh: () => renderClock(true)
  };

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
      // 导航现在是真链接：允许 ⌘/Ctrl 点击新标签打开，普通点击交给路由。
      if (pageButton.tagName === 'A') {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
      }
      go(pageButton.dataset.page);
      return;
    }

    const action = event.target.closest('[data-action]');
    if (!action) return;
    if (action.dataset.action === 'today') {
      if (state.currentWeekday !== null) pick(state.currentWeekday);
      go('today');
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
  renderMarket();
  renderTraining();
  renderClock(true);
  go(location.hash.slice(1), false);

  // 顶栏在滚动后加一条分隔线
  const markScrolled = () => {
    document.documentElement.dataset.scrolled = window.scrollY > 6 ? 'true' : 'false';
  };
  window.addEventListener('scroll', markScrolled, { passive: true });
  markScrolled();

  const cachedWeather = readWeatherCache();
  if (cachedWeather) {
    renderWeather(cachedWeather.data, cachedWeather.savedAt, true);
    weatherLastFetch = cachedWeather.savedAt;
  }
  refreshWeather();

  $('weatherRefresh')?.addEventListener('click', refreshWeather);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - weatherLastFetch > 15 * 60 * 1000) {
      refreshWeather();
    }
  });

  setInterval(() => renderClock(), 10000);
  setInterval(refreshWeather, 15 * 60 * 1000);
})();
