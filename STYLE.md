# Evening Gown · 开发风格指南 (Style Guide)

本文档基于 `DESIGN.md`，定义了项目的代码实现规范、Sass 变量架构以及色彩系统。

## 1. 技术栈与工具

- **CSS 预处理器**: Sass (`.scss`)
- **色彩空间**: OKLCH (用于获得更均匀的感知亮度和更鲜艳的颜色)
- **包管理器**: pnpm
- **动效库**: GSAP (ScrollTrigger)
- **3D 引擎**: Three.js

---

## 2. 目录结构 (Sass Architecture)

遵循 7-1 模式的简化版：

```text
src/assets/styles/
├── main.scss              # 主入口文件，在 main.ts 中引入
├── abstracts/             # 抽象层：变量、函数、Mixin (不输出 CSS)
│   ├── _functions.scss    # 包含 hex-to-oklch 转换工具
│   ├── _variables.scss    # Design Tokens (颜色、字号、间距)
│   └── _mixins.scss       # 媒体查询、常用样式块
├── base/                  # 基础层：重置、全局排版
│   ├── _reset.scss
│   └── _typography.scss
└── components/            # 组件级样式 (可选，Vue 组件内通常使用 <style scoped>)
    └── _buttons.scss      # 通用按钮样式
```

---

## 3. 色彩系统 (Color System - OKLCH)

我们将使用 `oklch(L C H)` 表示颜色。

- **L (Lightness)**: 0% (黑) - 100% (白)
- **C (Chroma)**: 0 (灰) - 0.37+ (高饱和)
- **H (Hue)**: 0 - 360 (色相环)

### 3.1 核心色板 (Palette)

> 注：以下 OKLCH 值由原始 HEX 近似转换而来，保持了感官一致性。

**Purple (主色调)**

- `$color-purple-50`: `oklch(96% 0.01 300)` (原 #F6F2F8)
- `$color-purple-100`: `oklch(92% 0.03 300)` (原 #E9DFF5)
- `$color-purple-500`: `oklch(65% 0.12 290)` (原 #A78BBF)
- `$color-purple-700`: `oklch(35% 0.15 290)` (原 #5B3A7A)
- `$color-purple-900`: `oklch(20% 0.10 290)` (新增深色背景)

**Gold (点缀色)**

- `$color-gold-100`: `oklch(93% 0.05 85)` (原 #F4E8D0)
- `$color-gold-400`: `oklch(75% 0.12 80)` (原 #C8A667)
- `$color-gold-600`: `oklch(68% 0.14 75)` (原 #B89A5A)

**Neutral (中性色)**

- `$color-neutral-0`: `oklch(100% 0 0)` (原 #FFFFFF)
- `$color-neutral-50`: `oklch(98% 0.005 300)` (原 #FAF7FB)
- `$color-neutral-200`: `oklch(88% 0.02 290)` (原 #D8D2E0)
- `$color-neutral-500`: `oklch(50% 0.03 290)` (原 #6F6577)
- `$color-neutral-800`: `oklch(25% 0.02 290)` (原 #2B2730)

### 3.2 主题系统 (Theming)

项目支持浅色 (Light) 和深色 (Dark) 两种主题。通过 CSS 变量实现动态切换。

**使用方法：**
在 `html` 标签上添加 `data-theme="dark"` 属性即可切换至深色模式。

```html
<html data-theme="dark"></html>
```

**语义变量映射表：**

| 变量名 (`--color-*`) | Light (Default)      | Dark                 |
| :------------------- | :------------------- | :------------------- |
| `bg-page`            | `$color-purple-50`   | `$color-purple-900`  |
| `bg-section-alt`     | `$color-neutral-0`   | `$color-neutral-800` |
| `text-primary`       | `$color-neutral-800` | `$color-purple-50`   |
| `brand-primary`      | `$color-purple-500`  | `$color-purple-500`  |
| `brand-accent`       | `$color-gold-400`    | `$color-gold-400`    |

---

## 4. 排版规范 (Typography)

### 4.1 字体栈

```scss
$font-family-base: 'Source Han Sans SC', 'Noto Sans SC', system-ui, sans-serif;
$font-family-serif: 'Playfair Display', 'Cormorant Garamond', serif;
```

### 4.2 字号 (Scale)

使用 `rem` 单位，基准 16px。

- `xs`: 0.75rem
- `sm`: 0.875rem
- `md`: 1rem
- `lg`: 1.125rem
- `xl`: 1.5rem
- `2xl`: 2rem
- `3xl`: 2.5rem
- `4xl`: 3.5rem

---

## 5. 间距与布局 (Spacing & Layout)

### 5.1 间距系统 (4px grid)

- `$space-1`: 0.25rem (4px)
- `$space-4`: 1rem (16px)
- `$space-8`: 4rem (64px)

### 5.2 容器

- `$container-max-width`: 1200px
- `$grid-columns`: 12
- `$grid-gap`: $space-5

---

## 6. 动效规范 (Motion)

使用 GSAP 进行复杂动效，CSS Transition 处理简单交互。

- `$ease-out`: cubic-bezier(0.25, 0.8, 0.25, 1);
- `$duration-base`: 0.3s;

---

## 7. 开发注意事项

1.  **Sass 函数**: 使用 `hex-to-oklch($hex)` 工具函数将设计稿的 HEX 转换为 OKLCH (如果需要)。
2.  **CSS 变量**: 尽量使用 CSS 变量 (`var(--name)`) 而不是 Sass 变量，以便于运行时调整和主题扩展。
3.  **Scoped Styles**: Vue 组件内默认使用 `<style scoped lang="scss">`。
