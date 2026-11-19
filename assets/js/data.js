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
        ["22:30–22:50", "准备第二天用品"],
        ["22:50–23:30", "放松、准备入睡"],
        ["23:30–07:00", "睡眠"]
      ],
      "restEvening": [
        ["18:40–19:10", "遛狗30分钟"],
        ["19:10–19:50", "晚餐：外卖／外食／即食简餐"],
        ["19:50–20:20", "家务、洗衣服、整理"],
        ["20:20–21:45", "游戏、电影或兴趣活动"],
        ["21:45–22:25", "晚间洗护：刷牙、洗澡、按需洗头和吹干、洁面保湿"],
        ["22:25–22:45", "整理次日用品"],
        ["22:45–23:30", "安静放松"],
        ["23:30–07:00", "睡眠"]
      ],
      "sat": [
        ["07:00–07:15", "起床、洗漱、简单护肤"],
        ["07:15–07:55", "遛狗40分钟"],
        ["07:55–08:30", "早餐、喂狗"],
        ["08:30–11:30", "家务、采购、自由活动"],
        ["11:30–12:30", "午餐：外食或外卖"],
        ["12:30–13:30", "休息"],
        ["13:30–17:00", "外出、城市探索或参加社交活动"],
        ["17:00–18:00", "返回、休息"],
        ["18:00–18:30", "遛狗"],
        ["18:30–19:30", "晚餐：外食或外卖"],
        ["19:30–21:45", "自由娱乐"],
        ["21:45–22:20", "晚间洗护：刷牙、洗澡、按需洗头和吹干、洁面保湿"],
        ["22:20–23:30", "放松、准备睡觉"],
        ["23:30–07:00", "睡眠"]
      ],
      "sun": [
        ["07:00–07:15", "起床、洗漱、简单护肤"],
        ["07:15–08:00", "遛狗45分钟"],
        ["08:00–08:40", "早餐"],
        ["08:40–11:30", "家务、采购或轻松外出"],
        ["11:30–12:30", "午餐：外食或外卖"],
        ["12:30–13:30", "午休"],
        ["13:30–16:30", "游戏、电影、自由活动"],
        ["16:30–17:30", "整理房间、准备下周"],
        ["17:30–18:10", "遛狗"],
        ["18:10–19:00", "晚餐：外食或外卖"],
        ["19:00–21:30", "自由娱乐、联系朋友"],
        ["21:30–22:10", "晚间洗护：刷牙、洗澡、按需洗头和吹干、洁面保湿"],
        ["22:10–23:30", "放松"],
        ["23:30–07:00", "睡眠"]
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
      "sourceName": "来源",
      "sourceUrl": "https://uapis.cn/docs/api-reference/get-misc-weather"
    },
    "titles": {
      "today": ["今天", "现在做什么、今天吃什么、今天练不练"],
      "eat": ["饮食", "每餐怎么配、外卖怎么点、买什么"],
      "train": ["训练", "每周三次，动作表先留好位置"],
      "social": ["社交", "每周一个动作，慢慢认识人"]
    },
    "navLabels": {
      "today": "今天",
      "eat": "饮食",
      "train": "训练",
      "social": "社交"
    },
    "mealIdeas": {
      "breakfast": [
        "2 个蛋 + 豆浆 + 香蕉",
        "包子 + 蛋 + 牛奶",
        "三明治 + 无糖酸奶"
      ],
      "lunch": [
        "鸡腿饭 + 青菜",
        "牛肉面 + 一份青菜",
        "黄焖鸡 + 青菜（少浇汁）",
        "番茄牛腩饭 + 青菜"
      ],
      "dinner": [
        "鸡胸 + 两拳蔬菜 + 半碗饭",
        "鱼或虾 + 菠菜 + 半碗饭",
        "豆腐 + 番茄 + 半碗饭",
        "外卖一荤一素 + 半碗饭"
      ],
      "snack": "水果一个，或无糖酸奶"
    },
    "market": {
      "fruit": [
        ["香蕉", "1 把 · 5–6 根"],
        ["橘子 / 橙子", "5 个"],
        ["苹果", "3 个"],
        ["猕猴桃 / 梨", "1–2 个"],
        ["圣女果 或 蓝莓", "1 盒"]
      ],
      "veg": [
        ["黄瓜", "3 根（可生吃）"],
        ["圣女果", "1 盒"],
        ["胡萝卜", "2 根（切条生吃）"],
        ["冷冻西兰花", "1 袋（微波 3 分钟）"],
        ["无糖酸奶", "4 杯"],
        ["卤蛋 / 即食鸡胸", "5 份"]
      ]
    },
    "training": {
      "note": "动作表先留空：在 assets/js/data.js 的 training.days[].items 里填，页面会自动显示；没填时这里显示占位。",
      "days": [
        { "key": "A", "name": "推", "hint": "胸 · 肩 · 三头", "weekday": 0, "items": [] },
        { "key": "B", "name": "拉", "hint": "背 · 二头 · 核心", "weekday": 2, "items": [] },
        { "key": "C", "name": "腿", "hint": "腿 · 臀 · 核心", "weekday": 4, "items": [] }
      ]
    },
    "photoCollections": [
      {
        "id": "kobe",
        "label": "科比",
        "photos": [
          { "src": "assets/img/kobe-1.jpg", "source": "https://www.nicekicks.com/every-sneaker-kobe-bryant-played/", "credit": "科比 8 号时期 · Nice Kicks", "license": "版权归原作者/媒体所有，仅个人浏览使用" },
          { "src": "assets/img/kobe-2.jpg", "source": "https://k.sina.cn/article_3291972494_c437838e001002b2v.html", "credit": "科比 8 号时期扣篮 · 新浪", "license": "版权归原作者/媒体所有，仅个人浏览使用" },
          { "src": "assets/img/kobe-3.jpg", "source": "https://www.kpbs.org/news/2020/01/26/basketball-legend-kobe-bryant-and-daughter-gianna", "credit": "科比 8 号时期 · Andrew D. Bernstein / Getty Images / KPBS", "license": "版权归原作者/媒体所有，仅个人浏览使用" },
          { "src": "assets/img/kobe-4.jpg", "source": "https://www.olay.com.tr/kobe-bryantin-nbae-giris-hikayesi-film-oluyor-1496614", "credit": "科比 8 号时期比赛扣篮 · Olay", "license": "版权归原作者/媒体所有，仅个人浏览使用" },
          { "src": "assets/img/kobe-5.jpg", "source": "https://baijiahao.baidu.com/s?id=1650525896634285345", "credit": "科比 8 号时期 · 百家号", "license": "版权归原作者/媒体所有，仅个人浏览使用" },
          { "src": "assets/img/kobe-6.jpg", "source": "https://www.sohu.com/picture/343114985", "credit": "科比 8 号时期 · 搜狐", "license": "版权归原作者/媒体所有，仅个人浏览使用" },
          { "src": "assets/img/kobe-7.jpg", "source": "http://www.sohu.com/a/161337853_405481", "credit": "科比 8 号时期投篮 · 搜狐体育", "license": "版权归原作者/媒体所有，仅个人浏览使用" }
        ]
      },
      {
        "id": "edwards",
        "label": "爱德华兹",
        "photos": [
          { "src": "assets/img/edwards-1.jpg", "source": "https://commons.wikimedia.org/wiki/File:Anthony_Edwards.jpg", "credit": "Anthony Edwards · CCS Pictures", "license": "CC BY-SA 2.0" },
          { "src": "assets/img/edwards-2.jpg", "source": "https://commons.wikimedia.org/wiki/File:Anthony_Edwards_Georgia_(cropped).jpg", "credit": "Anthony Edwards · Katie Dugan / Gamecock Central", "license": "CC BY 2.0" },
          { "src": "assets/img/edwards-3.jpg", "source": "https://commons.wikimedia.org/wiki/File:Anthony_Edwards_Georgia_2_(cropped).jpg", "credit": "Anthony Edwards · Katie Dugan / Gamecock Central", "license": "CC BY 2.0" },
          { "src": "assets/img/edwards-4.jpg", "source": "http://k.sina.com.cn/article_7880068820_1d5b04ed402001h6ve.html", "credit": "安东尼·爱德华兹 · 新浪体育", "license": "版权归原作者/媒体所有，仅个人浏览使用" },
          { "src": "assets/img/edwards-5.jpg", "source": "https://new.qq.com/omn/20220917/20220917A074LX00.html", "credit": "安东尼·爱德华兹 · 腾讯体育", "license": "版权归原作者/媒体所有，仅个人浏览使用" },
          { "src": "assets/img/edwards-6.jpg", "source": "https://baijiahao.baidu.com/s?id=1783441125870902722", "credit": "安东尼·爱德华兹扣篮 · 百家号", "license": "版权归原作者/媒体所有，仅个人浏览使用" }
        ]
      },
      {
        "id": "mitsui",
        "label": "三井寿",
        "photos": [
          { "src": "assets/img/mitsui-1.jpg", "source": "https://baijiahao.baidu.com/s?id=1660349837363950720", "credit": "三井寿（长发时期）· 动画截图 / 百家号", "license": "版权归井上雄彦/集英社/动画制作方所有，仅个人浏览使用" },
          { "src": "assets/img/mitsui-2.jpg", "source": "http://www.bilibili.com/video/BV13o4y1u7jz", "credit": "三井寿（回归球场）· 动画截图 / B站", "license": "版权归井上雄彦/集英社/动画制作方所有，仅个人浏览使用" },
          { "src": "assets/img/mitsui-3.jpg", "source": "http://dy.163.com/v2/article/detail/CRR2P8LU0514DJF7.html", "credit": "三井寿 · 动画截图 / 网易", "license": "版权归井上雄彦/集英社/动画制作方所有，仅个人浏览使用" },
          { "src": "assets/img/mitsui-4.jpg", "source": "http://huaban.com/pins/2824590159/", "credit": "三井寿 · 动画截图 / 花瓣", "license": "版权归井上雄彦/集英社/动画制作方所有，仅个人浏览使用" },
          { "src": "assets/img/mitsui-5.jpg", "source": "http://fun.youth.cn/gnzx/202101/t20210118_12669054.htm", "credit": "三井寿「我想打篮球」· 动画截图 / 中国青年网", "license": "版权归井上雄彦/集英社/动画制作方所有，仅个人浏览使用" },
          { "src": "assets/img/mitsui-6.jpg", "source": "http://www.zcool.com.cn/work/ZNDM1ODYwNTI=.html", "credit": "三井寿 · 动画截图 / 站酷", "license": "版权归井上雄彦/集英社/动画制作方所有，仅个人浏览使用" },
          { "src": "assets/img/mitsui-7.jpg", "source": "http://m.sohu.com/a/253945021_99965556", "credit": "三井寿 · 彩色插画 / 搜狐", "license": "版权归井上雄彦/集英社/动画制作方所有，仅个人浏览使用" },
          { "src": "assets/img/mitsui-8.jpg", "source": "https://baijiahao.baidu.com/s?id=1632663063545945827", "credit": "三井寿 · 彩色插画 / 百家号", "license": "版权归井上雄彦/集英社/动画制作方所有，仅个人浏览使用" },
          { "src": "assets/img/mitsui-9.jpg", "source": "http://www.bilibili.com/read/cv1690840/", "credit": "三井寿投篮 · 彩色插画 / B站", "license": "版权归井上雄彦/集英社/动画制作方所有，仅个人浏览使用" }
        ]
      }
    ]
  };

  root.LifePlanData = data;
  if (typeof module !== 'undefined') module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
