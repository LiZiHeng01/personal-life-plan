/* 生活计划数据：修改作息、季节文案、照片时只需要改这个文件。 */
(function (root) {
  const data = {
    "names": [
      "周一",
      "周二",
      "周三",
      "周四",
      "周五",
      "周六",
      "周日"
    ],
    "gym": [
      0,
      2,
      4
    ],
    "schedules": {
      "morning": [
        ["07:00–07:10", "起床、洗漱、简单护肤"],
        ["07:10–07:40", "晨间遛狗30分钟"],
        ["07:40–08:10", "喂狗、换衣、整理发型"],
        ["08:10–08:25", "通勤，路上买早餐"],
        ["08:30–11:45", "上午工作"],
        ["11:45–11:55", "通勤返回"],
        ["11:55–12:10", "吃午饭（提前点好外卖或外带）"],
        ["12:10–12:15", "陪狗狗、简单收拾"],
        ["12:15–12:30", "午睡15分钟"],
        ["12:30–12:35", "起床、洗脸、准备出门"],
        ["12:35–12:45", "通勤返回"],
        ["12:45–18:30", "下午工作（含可能加班）"],
        ["18:30–18:40", "通勤返回"]
      ],
      "gymEvening": [
        ["18:40–19:05", "遛狗25分钟"],
        ["19:05–19:35", "晚餐：外卖／外食／即食简餐"],
        ["19:35–19:50", "休息、换健身服"],
        ["19:50–19:55", "步行前往健身房"],
        ["19:55–20:05", "热身"],
        ["20:05–21:05", "健身（训练内容自行安排）"],
        ["21:05–21:10", "步行返回"],
        ["21:10–21:50", "晚间洗护：刷牙、洗澡、按需洗头和吹干、洁面保湿"],
        ["21:50–22:30", "游戏、自由娱乐"],
        ["22:30–22:45", "准备第二天用品"],
        ["22:45–23:00", "放松、准备入睡"],
        ["23:00–07:00", "目标睡眠"]
      ],
      "restEvening": [
        ["18:40–19:10", "遛狗30分钟"],
        ["19:10–19:50", "晚餐：外卖／外食／即食简餐"],
        ["19:50–20:20", "家务、洗衣服、整理"],
        ["20:20–21:45", "游戏、电影或兴趣活动"],
        ["21:45–22:25", "晚间洗护：刷牙、洗澡、按需洗头和吹干、洁面保湿"],
        ["22:25–22:40", "整理次日用品"],
        ["22:40–23:00", "安静放松"],
        ["23:00–07:00", "目标睡眠"]
      ],
      "sat": [
        ["08:00–08:15", "起床、洗漱、简单护肤"],
        ["08:15–08:55", "遛狗40分钟"],
        ["08:55–09:30", "早餐、喂狗"],
        ["09:30–11:30", "家务、采购、自由活动"],
        ["11:30–12:30", "午餐：外食或外卖"],
        ["12:30–13:30", "休息"],
        ["13:30–17:00", "外出、城市探索或参加社交活动"],
        ["17:00–18:00", "返回、休息"],
        ["18:00–18:30", "遛狗"],
        ["18:30–19:30", "晚餐：外食或外卖"],
        ["19:30–21:45", "自由娱乐"],
        ["21:45–22:20", "晚间洗护：刷牙、洗澡、按需洗头和吹干、洁面保湿"],
        ["22:20–23:00", "放松、准备睡觉"],
        ["23:00–08:00", "目标睡眠"]
      ],
      "sun": [
        ["08:00–08:15", "起床、洗漱、简单护肤"],
        ["08:15–09:00", "遛狗45分钟"],
        ["09:00–09:40", "早餐"],
        ["09:40–11:30", "家务、采购或轻松外出"],
        ["11:30–12:30", "午餐：外食或外卖"],
        ["12:30–13:30", "午休"],
        ["13:30–16:30", "游戏、电影、自由活动"],
        ["16:30–17:30", "整理房间、准备下周"],
        ["17:30–18:10", "遛狗"],
        ["18:10–19:00", "晚餐：外食或外卖"],
        ["19:00–21:30", "自由娱乐、联系朋友"],
        ["21:30–22:10", "晚间洗护：刷牙、洗澡、按需洗头和吹干、洁面保湿"],
        ["22:10–23:00", "放松"],
        ["23:00–07:00", "目标睡眠"]
      ]
    },
    "seasonOrder": ["spring", "summer", "autumn", "winter"],
    "seasonData": {
      "spring": {
        "name": "春季",
        "skin": "轻薄保湿，注意防风",
        "desc": "4–5月回暖较慢，海雾和大风多",
        "walk": "早晚遛狗可逐步增加到30–40分钟；遇到海雾、大风或降雨时缩短路线，尽量走熟悉、明亮的地方。",
        "gym": "训练前充分热身，出汗后及时擦干换衣；海边风大时注意保暖，避免着凉。",
        "social": "周六下午适合公园、轻徒步、羽毛球和宠物活动；出门带防风外套，留意海雾和大风。"
      },
      "summer": {
        "name": "夏季",
        "skin": "清爽保湿，注意防晒",
        "desc": "6–9月湿度高，海雾、阵雨和紫外线明显",
        "walk": "避开正午暴晒，清晨或日落后遛狗；海雾天缩短路线，随身带水，先摸地面确认不烫脚。",
        "gym": "训练前后补水，健身房注意通风；台风、雷雨或高温预警时改为室内轻量活动。",
        "social": "优先上午或傍晚户外活动；炎热或海雾天选择室内桌游、球馆和咖啡馆，留意台风与雷雨预警。"
      },
      "autumn": {
        "name": "秋季",
        "skin": "轻薄保湿，干燥时稍加滋润",
        "desc": "10–11月天高气爽，海风渐强、降温快",
        "walk": "晨间可正常散步；晚间风大天凉，走避风、照明好的路线，按体感调整时长。",
        "gym": "健身前充分热身，训练后及时穿上外套；饮食以温热正餐为主。",
        "social": "周六下午利用日光出门，优先室内外结合的活动；海边注意防风，降温时备好外套。"
      },
      "winter": {
        "name": "冬季",
        "skin": "用较滋润的面霜保湿，注意防风",
        "desc": "12–3月湿冷、海风大，体感温度低",
        "walk": "早晨按气温和风力安排10–30分钟；晚间走明亮、避风路线，大风或寒潮时改为室内互动，并注意狗狗保暖。",
        "gym": "出门穿防风外套，训练前热身10分钟；训练后及时擦汗保暖，优先温热易消化的餐食。",
        "social": "周六13:30–16:30优先室内活动或白天短时户外；适合桌游、羽毛球馆和宠物友好室内场所。"
      }
    },
    "weather": {
      "city": "青岛",
      "adcode": "370200",
      "url": "https://uapis.cn/api/v1/misc/weather?adcode=370200",
      "sourceName": "天气来源",
      "sourceUrl": "https://uapis.cn/docs/api-reference/get-misc-weather"
    },
    "titles": {
      "overview": ["我的生活手账", "青岛的作息、健身和一点自己的时间"],
      "schedule": ["每日作息", "工作日精确安排，周末保留自由"],
      "social": ["社交拓展计划", "从慢热到熟悉，不强迫自己突然外向"],
      "habits": ["习惯与个人护理", "睡眠、遛狗、洗漱护肤，逐步稳定"]
    },
    "photoCollections": [
      {
        "id": "kobe",
        "label": "科比",
        "photos": [
          { "src": "assets/img/kobe-1.jpg", "source": "https://www.nicekicks.com/every-sneaker-kobe-bryant-played/", "credit": "科比 8 号时期 · Nice Kicks", "license": "版权归原作者/媒体所有，仅个人浏览使用" },
          { "src": "assets/img/kobe-2.jpg", "source": "https://k.sina.cn/article_3291972494_c437838e001002b2v.html", "credit": "科比 8 号时期扣篮 · 新浪", "license": "版权归原作者/媒体所有，仅个人浏览使用" },
          { "src": "assets/img/kobe-3.jpg", "source": "https://www.kpbs.org/news/2020/01/26/basketball-legend-kobe-bryant-and-daughter-gianna", "credit": "科比 8 号时期 · Andrew D. Bernstein / Getty Images / KPBS", "license": "版权归原作者/媒体所有，仅个人浏览使用" },
          { "src": "assets/img/kobe-4.jpg", "source": "https://www.olay.com.tr/kobe-bryantin-nbae-giris-hikayesi-film-oluyor-1496614", "credit": "科比 8 号时期比赛扣篮 · Olay", "license": "版权归原作者/媒体所有，仅个人浏览使用" }
        ]
      },
      {
        "id": "edwards",
        "label": "爱德华兹",
        "photos": [
          { "src": "assets/img/edwards-1.jpg", "source": "https://commons.wikimedia.org/wiki/File:Anthony_Edwards.jpg", "credit": "Anthony Edwards · CCS Pictures", "license": "CC BY-SA 2.0" },
          { "src": "assets/img/edwards-2.jpg", "source": "https://commons.wikimedia.org/wiki/File:Anthony_Edwards_Georgia_(cropped).jpg", "credit": "Anthony Edwards · Katie Dugan / Gamecock Central", "license": "CC BY 2.0" },
          { "src": "assets/img/edwards-3.jpg", "source": "https://commons.wikimedia.org/wiki/File:Anthony_Edwards_Georgia_2_(cropped).jpg", "credit": "Anthony Edwards · Katie Dugan / Gamecock Central", "license": "CC BY 2.0" }
        ]
      },
      {
        "id": "mitsui",
        "label": "三井寿",
        "photos": [
          { "src": "assets/img/mitsui-1.jpg", "source": "https://note.com/don2001/n/n74921371bff4", "credit": "三井寿 · 井上雄彦《灌篮高手》漫画分镜", "license": "版权归井上雄彦/集英社所有，仅个人浏览使用" },
          { "src": "assets/img/mitsui-2.jpg", "source": "https://note.com/campintheair/n/ne2d336a562f4", "credit": "三井寿 · 井上雄彦《灌篮高手》漫画分镜", "license": "版权归井上雄彦/集英社所有，仅个人浏览使用" },
          { "src": "assets/img/mitsui-3.jpg", "source": "https://note.com/coffeecandle/n/n05e6121560a7", "credit": "三井寿 · 井上雄彦《灌篮高手》漫画分镜", "license": "版权归井上雄彦/集英社所有，仅个人浏览使用" }
        ]
      }
    ]
  };

  root.LifePlanData = data;
  if (typeof module !== 'undefined') module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
