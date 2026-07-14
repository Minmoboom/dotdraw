# DotDraw

## 📌 项目概述

**DotDraw** 是一个在线网站（Web 应用），用户通过浏览器访问网址，注册登录后使用。用户用自然语言输入需求，平台调用 AI 模型自动生成**图片、视频**等内容。

**核心特点：**
- 🌐 部署在阿里云，有公开网址，可直接链接访问
- 👤 用户需要注册账号、登录后才能使用
- 💬 左侧对话式交互，用户输入需求、AI 返回结果
- 🖼️ 右侧案例展示区，由管理员配置

---

## 🎯 产品定位

让没有任何设计技能的用户，通过简单的文字描述，就能创建专业级的视觉内容。

---

## 🏗️ 技术和模型选型

| 组成部分 | 技术选择 | 说明 |
|----------|----------|------|
| 前端框架 | Next.js (React) | 页面和交互 |
| 后端服务 | Supabase | 用户登录 + 数据库 |
| AI 服务1 | deepseek v4 pro | 意图识别和决策大脑 |
| AI 服务2 | GLM-Image | 文生图 |
| AI 服务3 | 通义万相 | 视频生成 |
| 部署平台 | 阿里云 | 免费托管 |

---

## 工具和skills

工具列表（16个）

| 分类 | 工具名 | 用途 |
|------|--------|------|
| 搜索 | search_image | 搜索参考图片 — 库存照片、网络图片、设计模板、设计库 |
| 搜索 | web_search | 搜索公开网络的实时信息（趋势、品牌背景、法规等） |
| 搜索 | read_webpage | 深度阅读一个网页的完整内容 |
| 搜索 | explore_kit | 读取品牌设计套件，提取颜色/字体/参考图 |
| 图像 | generate_image | 生成图片（支持文生图、图生图，可多图融合） |
| 图像 | upscale | 将图片放大至 2K 或 4K 分辨率 |
| 图像 | remove_bg | 去除图片背景，生成透明 PNG |
| 3D | generate_3d_model | 生成 3D 模型（单图转3D、多视角转3D、文字生成3D） |
| HTML | generate_html | 生成 HTML 网页/海报（静态站点，支持多页） |
| HTML | edit_html | 精确编辑已有的 HTML 页面，只改指定部分 |
| 视频 | generate_video | 生成短视频（4-15秒），支持文生视频、图生视频 |
| 幻灯片 | generate_slides | 生成多页演示文稿/PPT（支持导出 .pptx/.pdf） |
| 幻灯片 | edit_slide | 修改演示文稿中的单页/多页，保留其余页面 |
| 幻灯片 | restyle_deck | 全局更换演示文稿的主题风格（颜色/字体/氛围） |
| 技能 | load_skill | 加载专项设计指南（品牌标识、电商产品图等14个） |
| 交互 | present_choices | 展示可点击选项卡片，让用户点击选择 |

---

Skills列表（14个）

| 分类 | Skill名 | 用途 |
|------|---------|------|
| 通用 | image-delivery | 默认图像技能 — 提示词撰写、多图融合、角色分配、避坑 |
| 品牌 | brand-identity | Logo / 品牌标志 / 视觉识别 / 品牌套件设计 |
| 品牌 | brand-campaign | 完整品牌视觉营销（棚拍→海报→概念→广告→包装→生活方式） |
| 电商 | ecommerce-product | 电商产品图（主图/卖点图/场景图） |
| 电商 | amazon-product | 亚马逊产品列表图片（主图+副图+A+页面） |
| 电商 | ugc-style | 真实素人风格的 UGC / 种草产品照片 |
| 社交 | instagram-post | Instagram 原生内容 — Feed/Story/Reel封面/轮播图 |
| 社交 | rednote-cover | 小红书封面图（3:4竖版，10种内容类型，8种布局） |
| 社交 | youtube-thumbnail | YouTube 缩略图（16:9，8种类型，120px手机适配） |
| 社交 | ad-creative | 多平台广告素材 — IG/FB/TikTok/LinkedIn/YouTube/Pinterest等 |
| 时尚 | fashion-outfit | 编辑级时尚穿搭造型 — 5种风格方向 |
| 视频 | video-creation | 短视频创作技巧 — 提示词撰写、时长控制、动作描述 |
| 视频 | drone-camera | 电影级无人机运镜视频 — 7变量镜头模板 |
| 演示 | slide-deck | 幻灯片/PPT设计方法论 — 反套牌配色、字体底线、版式布局 |


##  截图展示

主页
<img width="1912" height="914" alt="image" src="https://github.com/user-attachments/assets/850327c2-f7a4-4fa6-8031-b1f63a288742" />


对话页
<img width="1912" height="914" alt="image" src="https://github.com/user-attachments/assets/cc1dbeb8-8b2f-42be-af48-cc5f91eba6aa" />


---

## ❗️ 说明
1. 目前接入的都是国内模型，后续会尝试替换成gpt image 2和seedance 2
2. 后续会加入画布和项目管理，便于用户编辑
3. 目前小额充值，注册即可免费试用，欢迎设计师来反馈用法，可以联系我询问线上链接
4. 本人非技术出身，全程vibe coding，可能无法保证代码质量
5. 请不要随意转载
