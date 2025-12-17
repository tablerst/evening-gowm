# Evening Gown · White Phantom（白色幻影）

> **Theme Code: White Phantom / 白色幻影**
> 
> **Design Core: Linear Luxury / 线性奢华**

本项目是一个高端晚礼服店铺的宣传页面，采用 Vue 3 + TypeScript 开发。
视觉与交互以 **高调摄影（High-Key）**、**Linear 风格微边框**、**毛玻璃** 与 **珠光丝绸材质感** 为核心，强调“白中之白”的克制高级感。

## 📖 项目文档

详细的设计规范与开发指南请参考以下文档：

- **[🎨 UI Design Guide (DESIGN.md)](./DESIGN.md)**
  包含信息架构、Hero 首屏设计规范、排版体系及动效原则。
- **[💅 Style Guide (STYLE.md)](./STYLE.md)**
  包含色彩系统 (OKLCH)、Design Tokens 定义及主题配置说明。

## 💎 设计理念

> “奢华不靠饱和度取胜，而靠结构、材质与留白。”

本项目的设计核心在于 **克制** 与 **建筑感**：

- **白中之白**：通过“结构白/材质白”的细微冷暖差异构建空间深度（避免纯白刺眼）。
- **Linear Luxury**：用 1px 微边框、玻璃拟态与极淡的环境阴影，建立精确但不冰冷的秩序感。
- **珠光材质**：在 WebGL 丝绸中模拟菲涅尔色移与高光碎裂感，服务于“展厅预展（Vernissage）”的沉浸体验。

## ✨ 核心特性

### 1. 沉浸式视觉 (Immersive Visuals)
- **Hero 首屏（Vernissage 预展）**：以干净明亮的高调背景与 WebGL 丝绸模拟作为氛围核心，强调珠光高光与缓慢流体动效。
- **Bento Grid 叙事**：采用非对称便当盒网格，将礼服/材质/叙事拆分成模块化卡片，留白充足、节奏明确。

### 2. 细腻交互 (Micro-interactions)
- **动效原则**：慢、溶解、模糊过渡与流动（避免 Q 弹与剧烈位移）。
- **按钮/卡片反馈**：Hover 更偏“边缘发光 / 内发光”，卡片不上浮，用细节传达质感。

### 3. 主题系统 (Theming)
- 定义语义化的 Design Tokens（参考 `STYLE.md`），用于背景、文字、边框、玻璃拟态与阴影。
- 核心色板（摘录）：
  - **Atelier Mist（工坊迷雾）**：`#F9F9F9`
  - **Pure Silk（纯丝）**：`#FFFFFF`
  - **Charcoal Ink（炭墨）**：`#1A1A1A`
  - **Stone Grey（岩石灰）**：`#595959`
  - **Platinum Hairline（铂金丝）**：`#E5E5E5`
  - **Champagne（香槟金，克制使用）**：`#D4AF37`

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
