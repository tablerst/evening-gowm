# Evening Gown · FLEURLIS（白色幻影）

> **Theme Code: FLEURLIS / 白色幻影**
> 
> **Design Core: Industrial Precision / 工业级精度 · The Archive / 档案库**

本项目是一个面向 B2B 批发业务的晚礼服产品站点（含后台），采用 Vue 3 + TypeScript 开发。
视觉与交互遵循 `DESIGN.md` 与 `STYLE.md`：以 **日系冷调（Cyan Shift）**、**锐利几何（0px 圆角）**、**高密度信息展示** 与 **绝对平面（Flat）** 为核心，强调“稳定、高效、专业”的数字档案库体验。

## 📖 项目文档

详细的设计规范与开发指南请参考以下文档：

- **[🎨 UI Design Guide (DESIGN.md)](./DESIGN.md)**
  包含信息架构、Hero 首屏设计规范、排版体系及动效原则。
- **[💅 Style Guide (STYLE.md)](./STYLE.md)**
  包含三色原则、字体体系、交互动效（Hard Cut）、滤镜配方与 Design Tokens 定义。

## 💎 设计理念

> “B2B 的高级感来自秩序、对比与效率，而不是装饰。”

本项目的设计核心是 **工业级精度** 与 **档案库隐喻**：

- **档案库（The Archive）**：从“画廊式浏览”转向“检索式浏览”，让批发客户能在单屏读取更多款式与关键信息。
- **三色原则（Tri-Chromatic）**：全站配色严格控制在 3 个核心色（商品图片除外）。
- **锐利几何（Sharp Geometry）**：全局 `0px` 圆角；用 `1px` 边框/分割线建立层级（而非阴影与拟物）。
- **硬切动效（Hard Cut）**：避免缓动与淡入淡出；强调“操作即反馈”，接近交易终端/工业面板的响应。
- **冷剧滤镜（Japanese Cold Drama）**：Hero 视频与氛围图统一使用青色偏移滤镜，强化冷峻与通透的工业基调。

## ✨ 核心特性

### 1. 制造剧场 (Production Theatre)
- **Hero 首屏**：100vh 循环视频（工厂/针脚/剪裁/面料质感），叠加冷调滤镜；前景文字使用等宽字体，像“字幕/注释”一样传递制造能力与交付信任。
- **信息外显**：不追求大段品牌故事，优先展示“可验证的信息”（产能、交期、流程、款号）。

### 2. 高效交互 (B2B Micro-interactions)
- **动效原则**：Hard Cut（瞬时切换）；避免弹性/缓动/长过渡，让操作像“开关”一样明确。
- **卡片交互**：Hover 0 延迟切换到细节图/面料微距；不使用上浮阴影，用边框颜色变化表达状态。
- **截图友好**：高对比度的排版与边框，适配微信沟通的“截图即报价/确认”的工作流。

### 3. 主题系统 (Theming)
- 主题与组件风格以 `STYLE.md` 为准，核心约束：
  - **Canvas**：`#FFFFFF`（绝对白）
  - **Structure**：`#000000`（结构黑，用于文字/线条）
  - **Brand**：`#000226`（Midnight Abyss，唯一品牌色，用于 CTA / Hover / Ticker 背景）
  - **Border**：默认 `1px` 描边（如 `#E2E8F0`），用于表格线与空间分割
  - **Geometry**：全局圆角 `0px`；禁止弥散投影/渐变/玻璃拟态
  - **Typography**：标题偏 Display（Bodoni Moda，全大写）；正文 Inter；数据/参数 JetBrains Mono 或 DIN
  - **Filters**：Hero/氛围图使用 Cyan Shift 滤镜配方（见 `STYLE.md`）

## 🛠️ 技术栈

- **Core**: Vue 3, TypeScript, Vite
- **State**: Pinia
- **Styling**: Tailwind CSS（配合设计 Token）
- **Motion**: GSAP (ScrollTrigger)
- **3D / Visuals**: Three.js (Silk simulation)

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 🧭 路由与布局（方案 B 推荐结构）

本项目采用 **Vue Router** 管理页面，并通过 **Layout（布局组件）** 统一承载导航栏/页脚等全局 UI。

- 路由入口：`src/router/index.ts`
- 默认布局：`src/layouts/DefaultLayout.vue`
- 空白布局：`src/layouts/BlankLayout.vue`（用于 Preview 等“无导航/无页脚”页面）
- 页面（Views）：`src/views/*`

页面通过 `route.meta.layout` 选择布局：

- `layout: 'default'` → `DefaultLayout`
- `layout: 'blank'` → `BlankLayout`

## 🔒 预览模式（上线前开关）

使用 `.env` 中的 `VITE_PREVIEW` 控制是否进入“开发中提示页”。

- `VITE_PREVIEW=true`：全站强制跳转至 `/preview`，仅展示“网站还在开发中”提示
- `VITE_PREVIEW=false`：正常访问站点内容

注意：修改 `.env` 后需要**重启开发服务器**才能生效。

## 📁 目录结构（维护导向）

```text
src/
  App.vue            # 应用壳：选择布局 + RouterView
  main.ts            # 创建应用并注册 Pinia/Router
  router/            # 路由
  layouts/           # 全局布局（Default/Blank）
  views/             # 页面级组件
  config/            # 配置与环境变量解析
  modules/           # 独立模块（如 silk/Three.js 渲染）
  assets/            # 样式与静态资源
```
