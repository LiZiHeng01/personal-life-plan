# 个人生活计划

一个纯静态的个人生活计划页面：作息、健身、社交与日常护理。没有后端、没有构建步骤，也不包含打卡或天气接口。

## 功能

- **总览**：日期、北京时间、当前进行中的安排，以及当天剩余的重点事项。
- **每日作息**：周一至周日的完整时间表，自动区分健身日、休息日和周末。
- **季节建议**：根据当前月份自动切换春、夏、秋、冬提示，也可以手动预览其他季节；作息中的遛狗和护肤文案会随季节微调。
- **社交拓展**：三阶段社交路线与适合慢热性格的活动建议。
- **习惯与护理**：早晚护理、睡眠目标和固定生活原则。
- **主题与路由**：支持深色模式并记住选择；页面使用 `#overview`、`#schedule`、`#social`、`#habits` 这样的哈希路由，刷新或分享链接不会丢失当前页面。
- **本地照片**：科比、爱德华兹、三井寿的照片全部存放在 `assets/img/`，每天轮换；不请求任何外部图片。

## 本地使用

直接双击 `index.html` 即可打开。也可以启动任意静态服务器：

```powershell
# 任选一种，不依赖具体工具
python -m http.server 4173
# 或
npx serve .
```

然后访问 `http://localhost:4173/`。

## 文件结构

```text
.
├─ index.html              页面结构与文案
├─ assets/
│  ├─ css/styles.css       样式（含深色模式与移动端布局）
│  ├─ js/data.js           作息、季节建议、照片元数据
│  ├─ js/app.js            渲染、路由、时钟、主题与照片轮换
│  └─ img/                 本地照片与 logo
├─ CREDITS.md              图片来源与版权说明
└─ README.md
```

## 修改内容

- **改作息**：编辑 `assets/js/data.js` 中的 `schedules`。每项是 `["时间", "安排"]`，跨午夜的时间段写成 `23:00–07:00` 即可。
- **改季节建议**：编辑 `seasonData` 里的 `walk`、`gym`、`social` 和 `skin`。
- **换照片**：把图片放进 `assets/img/`，再更新 `photoCollections` 中的 `src`、`source`、`credit` 和 `license`。建议保持 4:5 或接近的竖版比例。
- **改主题色**：编辑 `assets/css/styles.css` 顶部的 CSS 变量。

## 本地存储

页面只在自己的浏览器里保存两个偏好：

- `lifeplan-theme`：`light` 或 `dark`
- `lifeplan-season`：`auto` 或 `spring` / `summer` / `autumn` / `winter`

没有账号、cookie、统计脚本或服务端请求。

## 部署

仓库推送到 GitHub 的 `main` 分支后，在仓库 **Settings → Pages** 选择从 `main` 分支根目录发布即可。页面不需要构建产物。

线上地址：<https://liziheng01.github.io/personal-life-plan/>

## 图片说明

照片仅用于个人生活计划页面的装饰。科比与三井寿的图片版权归原作者、媒体或版权方所有；爱德华兹的部分图片来自 Wikimedia Commons，遵循 CC BY / CC BY-SA 许可。完整来源和许可信息见 [CREDITS.md](CREDITS.md)。
