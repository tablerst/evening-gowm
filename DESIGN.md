## 0. 项目定位 & 使用范围

**项目名（建议）：**
`Evening Gown · 淡雅紫金视觉系统 v1.0`

**适用范围：**

* 店铺晚礼服宣传单页（PC + Mobile）
* 后续可扩展到：小程序 / H5 活动页 / 线上预约页。

**风格关键词：**
淡雅、紫金、轻奢、仪式感、有设计感、带一些动效/3D 但不喧宾夺主。

---

## 1. Design Tokens 总览（给设计 & 前端的“共同语言”）

现代设计系统会把颜色、字号、间距等抽成 **Design Tokens**，便于设计和代码共享一套语义变量。([contentful.com][1])

我们这套先定义几大类：

* 颜色：`color.*`
* 字体：`font.family.*`
* 字号：`font.size.*`
* 行高：`line.height.*`
* 间距：`space.*`
* 圆角：`radius.*`
* 阴影：`shadow.*`
* 动效：`motion.*`
* 3D 场景：`three.*`（非严格 DS 标准，但方便你和开发对齐）

下面具体展开。

---

## 2. 颜色规范（淡雅紫金）

参考奢侈品网站常用的**深色主色 + 中性浅色背景 + 金属色点缀**，可以创造出稳定的高端感，同时保证可读性和可用性。([owdt.com][2])

### 2.1 原子色值（基础 Token）

```text
color.purple.50   = #F6F2F8   // 大面积背景淡紫
color.purple.100  = #E9DFF5   // 模块浅底、hover 背景
color.purple.500  = #A78BBF   // 主视觉紫（标题、小块背景）
color.purple.700  = #5B3A7A   // 深紫，用于按钮/高对比文字

color.gold.100    = #F4E8D0   // 非金属感浅金背景
color.gold.400    = #C8A667   // 香槟金主色（描边、icon）
color.gold.600    = #B89A5A   // 深一点的金，用于 hover 或强调线条

color.neutral.0   = #FFFFFF
color.neutral.50  = #FAF7FB   // 接近白的背景，过渡用
color.neutral.800 = #2B2730   // 主文字
color.neutral.500 = #6F6577   // 次要文字
color.neutral.200 = #D8D2E0   // 分割线、边框
```

### 2.2 语义色值（语义 Token）

```text
// 背景
color.bg.page        = color.purple.50
color.bg.section.alt = color.neutral.0
color.bg.hero        = color.purple.100
color.bg.card        = color.neutral.0
color.bg.overlay     = rgba(20, 10, 30, 0.4)

// 品牌 & 交互
color.brand.primary  = color.purple.500
color.brand.dark     = color.purple.700
color.brand.accent   = color.gold.400

// 文本
color.text.primary   = color.neutral.800
color.text.secondary = color.neutral.500
color.text.inverse   = color.neutral.0
color.text.muted     = rgba(111, 101, 119, 0.7)

// 边框 & 分割
color.border.subtle  = color.neutral.200
color.border.emphas  = color.gold.400

// 状态（留个扩展位）
color.state.success  = #4CAF50
color.state.error    = #E5484D
color.state.info     = color.purple.500
```

### 2.3 使用原则

* **金色绝不用大面积铺**：只用在线条、icon、hover 边框、小装饰上；奢侈品牌通常通过“少量金属色 + 大量中性色”来保持高级感。([owdt.com][2])
* 页面大面积使用 `color.bg.page` + `color.bg.section.alt`，紫色和金色都当“点缀”用。
* 所有文本与背景组合需保证至少 WCAG AA 对比度，尤其是淡紫背景 + 深紫文字。([UX Collective][3])

---

## 3. 排版规范（字体、字号、行高、字重）

奢侈品牌网站普遍采用**大图 + 极简排版 + 对比字体（几何无衬线 + 高对比衬线）**的组合。([monotype.com][4])

### 3.1 字体族 Token

```text
font.family.base    = "Source Han Sans SC", "Noto Sans SC", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
font.family.serif   = "Playfair Display", "Cormorant Garamond", "Times New Roman", serif
font.family.english = "Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

* 中文正文 & 大部分 UI：用 `font.family.base`
* 英文点缀（如 “SOIRÉE / ELEGANCE”）：可用 `font.family.serif` 或 `font.family.english` 上大号字。

### 3.2 字号 & 行高（基于 16px root）

Web 上普遍建议以 `16px` 为 HTML 基准，然后用 `rem` 按比例扩展，便于响应式控制整体文本比例。([DEV Community][5])

```text
// 基础
font.size.xs   = 0.75rem  // 12px  标签、角标
font.size.sm   = 0.875rem // 14px  次要信息
font.size.md   = 1rem     // 16px  正文
font.size.lg   = 1.125rem // 18px  正文放大 or 大按钮
font.size.xl   = 1.5rem   // 24px  小标题
font.size.2xl  = 2rem     // 32px  模块主标题
font.size.3xl  = 2.5rem   // 40px  首屏主标题移动端
font.size.4xl  = 3.5rem   // 56px  首屏主标题桌面端

// 行高
line.height.tight  = 1.2
line.height.normal = 1.5
line.height.loose  = 1.7
```

**使用建议：**

* Hero 主标题：

  * PC：`font.size.4xl`, `line.height.tight`
  * Mobile：`font.size.3xl`, `line.height.tight`
* 模块标题（“本季礼服系列”）：`font.size.2xl`, `line.height.tight`
* 卡片标题：`font.size.lg`, `line.height.normal`
* 正文：`font.size.md`, `line.height.loose`

### 3.3 字重 & 字间距

```text
font.weight.light   = 300
font.weight.normal  = 400
font.weight.medium  = 500
font.weight.semib   = 600
font.weight.bold    = 700
```

* 中文正文用 `400–500`，大标题用 `500–600`，避免 700 太“硬”破坏柔和感。
* 英文 serif 大写单词可以稍微扩一点 letter-spacing（0.05em 左右），提升“画报感”。

---

## 4. 间距 & 栅格（Layout）

清晰的 spacing scale 可以让整个页面看起来“干净、不拥挤”，各家设计系统（Material、USWDS 等）都会使用一套固定的间距尺寸做 token。([atlassian.design][6])

### 4.1 间距 Token（基于 4/8 点格）

```text
space.0   = 0
space.1   = 0.25rem  // 4px
space.2   = 0.5rem   // 8px
space.3   = 0.75rem  // 12px
space.4   = 1rem     // 16px
space.5   = 1.5rem   // 24px
space.6   = 2rem     // 32px
space.7   = 3rem     // 48px
space.8   = 4rem     // 64px
space.9   = 5rem     // 80px
```

**约定：**

* 文本段落之间：`space.3` 或 `space.4`
* 卡片内 padding：上下 `space.4`，左右 `space.5`
* 模块与模块之间：PC 用 `space.7 ~ space.8`；移动端可收窄到 `space.6`
* 页面左右边距：

  * PC：`max(6vw, space.7)`
  * 大屏（>1440）：`max(12vw, space.8)`
  * Mobile：`space.4`

### 4.2 栅格 & 内容宽度

```text
layout.container.maxWidth = 1200px   // 主内容最大宽度
layout.container.narrow   = 840px    // 文案/FAQ 区域
layout.grid.columns       = 12       // 12 列栅格
layout.grid.gap           = space.5  // 24px
```

* 收藏礼服列表：桌面端用 3 列卡片（≥ 1024px），平板 2 列，手机 1 列横向滑。
* 图片 + 文本分栏（英雄区、场景区）：

  * desktop: 5/7 或 6/6 切分；
  * mobile: 顺序改为图在上文在下。

---

## 5. 形状、阴影、线条

### 5.1 圆角 Token

```text
radius.none   = 0
radius.sm     = 4px
radius.md     = 8px
radius.lg     = 16px
radius.xl     = 24px   // 大块背景、Hero CTA
radius.pill   = 999px  // 圆角按钮/标签
```

**使用规则：**

* 按钮 / tag：`radius.pill`
* 卡片：`radius.lg`
* 大型斜切背景块：保持直角，由 clip-path 形成形状即可。

### 5.2 阴影 Token

```text
shadow.none   = none
shadow.sm     = 0 4px 10px rgba(0,0,0,0.04)
shadow.md     = 0 10px 30px rgba(15,10,40,0.12)
shadow.soft   = 0 18px 45px rgba(20,8,40,0.18)
```

* 卡片 hover 时用 `shadow.md`；
* 弹出层 / 图片放大使用 `shadow.soft`。

---

## 6. 组件规范（关键 UI 组件）

下面这些是“页面会反复出现的组件”，建议统一规范。

### 6.1 按钮 Button

**语义：**

* `button.primary` —— 预约 / 咨询 / 主行动
* `button.secondary` —— 辅助操作，如“查看系列”
* `button.ghost` —— 透明背景，只用边框

**样式 Token：**

```text
button.height.md         = 44px
button.height.lg         = 52px
button.padding.x         = space.5
button.radius            = radius.pill
button.font.size         = font.size.sm ~ md
button.font.weight       = font.weight.medium
motion.button.press      = 0.12s ease-out
motion.button.hover      = 0.2s ease-out
```

**颜色：**

* primary（默认）：

  * 背景：`color.brand.primary`
  * 文字：`color.text.inverse`
  * hover：背景 → `color.brand.dark`，增加轻微阴影

* secondary：

  * 背景：`transparent`
  * 边框：`color.border.emphas`（金色）
  * 文字：`color.brand.dark`
  * hover：背景加一层淡紫：`color.purple.100`

* ghost：

  * 只有文字，hover 时加底部下划线。

### 6.2 礼服卡片 Card.Gown

结构：

* 上：礼服图片 (3:4)
* 左下角：小 tag 标签（如 `#婚礼` `#年会`）
* 下方：

  * 名称
  * 场景/尺码信息行
  * 价格（可选，保持低调）

Token 规范：

```text
card.gown.radius         = radius.lg
card.gown.shadow.default = shadow.sm
card.gown.shadow.hover   = shadow.md
card.gown.padding        = space.4
card.gown.media.ratio    = 3:4
```

交互：

* hover：

  * 图片 scale 1 → 1.03
  * 下方半透明遮罩向上淡入，显示两个按钮：

    * `预约这款礼服`（primary）
    * `查看详情`（secondary / ghost）

### 6.3 斜切遮罩块 SlantedBlock

这是整个页面“高级感”的关键组件。

**实现建议：**

* 使用 `clip-path` 实现斜切，而不是拉歪整个容器，这样排版仍然是水平的，只有**容器边缘**斜。([Designveloper][7])
* 统一斜率：比如固定成 10°–15°（`clip-path: polygon(...)`），整个站只用这一个角度，保持语言统一。

Token 示例：

```text
slanted.angle               = 12deg  // 概念角度，仅供设计沟通
slanted.hero.bg             = color.purple.100
slanted.scene.bg            = color.neutral.0
slanted.overlay.color       = rgba(39, 8, 60, 0.45)
slanted.text.maxWidth       = 520px
```

使用场景：

* Hero 右侧图区域背景
* 场景分区之间的过渡
* 大图上的文字蒙版

---

## 7. 动效规范（GSAP / ScrollTrigger）

GreenSock 的 ScrollTrigger 官方文档里强调，“先保证性能和节制，再追求酷炫”，常见最佳实践包括：少量 timeline、合理 use `will-change`、避免给太多元素绑定 scroll 逻辑。([gsap.com][8])

### 7.1 全局动效 Token

```text
motion.duration.xs      = 0.18s
motion.duration.sm      = 0.25s
motion.duration.md      = 0.4s
motion.duration.lg      = 0.8s

motion.easing.base      = "power2.out"
motion.easing.soft      = "power3.out"
motion.easing.elastic   = "elastic.out(1, 0.7)"

motion.scroll.stagger   = 0.12s   // 列表淡入间隔
motion.scroll.threshold = 0.2     // 元素进入视口 20% 即触发
```

### 7.2 使用原则

1. **一次性入场，不要循环骚扰用户**

   * ScrollTrigger 动画 `once: true`，用户滚回去不重复放完整动画，最多淡入一下。

2. **Hero 入场 timeline：**

   * 背景斜块 → 标题 → 副标题 → 按钮 顺序入场。
   * 时长控制在 `0.6–0.8s` 内结束。

3. **卡片滚动淡入：**

   * `y: 30px, opacity: 0 → 1`
   * stagger 每个卡片之间 0.08–0.12s。

4. **斜切背景微动 / parallax：**

   * 给大块背景做 `yPercent` 轻微偏移（比如 -5% ~ 5%），ScrollTrigger 绑定到视口滚动比例。
   * 保持帧率，别在 mobile 上搞过多 parallax。

5. **性能要求：**

   * 所有动画元素总数控制（例如每屏不超过 20 个有 ScrollTrigger 的对象）。
   * 使用 `ScrollTrigger.batch` 批量处理列表动画。([gsap.com][9])

---

## 8. Three.js 背景规范

Three.js 非常适合用来做**品牌级 3D 背景、粒子特效**，但也非常容易玩过头。([threejs.org][10])

这里把它严格收在“背景氛围”，不抢礼服的风头。

### 8.1 使用范围

* 仅在 **首屏 Hero** 使用 1 个 Three.js 场景：

  * 紫金渐变的粒子 / 光晕 / 丝带，缓慢运动；
  * 位置在页面右上/右侧，和礼服图同一视觉区域层级。

### 8.2 视觉规范

Token 抽象：

```text
three.hero.enabled        = true
three.hero.style          = "particles-orb"  // 粒子光晕风格
three.hero.palette.main   = [color.purple.500, color.purple.700]
three.hero.palette.accent = [color.gold.400, color.gold.600]
three.hero.opacity        = 0.4 ~ 0.7
three.hero.motion.speed   = "slow" // ~0.02 ~ 0.04 per frame
three.hero.depth.soft     = true   // 远近差别柔和
```

约束：

* 粒子数适度，mobile 上自动减半甚至禁用（三.js 场景可选开关）。
* 3D 场景不出现具体人物/礼服形象，只是抽象光感，避免和真实照片撞风格。

---

## 9. 响应式 & 可访问性规范

### 9.1 断点定义

```text
breakpoint.xs = 0–599px      // 手机
breakpoint.sm = 600–899px    // 小平板
breakpoint.md = 900–1199px   // 大平板 / 小桌面
breakpoint.lg = 1200–1439px  // 标准桌面
breakpoint.xl = 1440px+      // 大屏
```

响应策略：

* xs/sm：单列布局，Hero 中图片优先，按钮做底部固定 CTA。
* md：2 列布局开始出现，礼服卡片 2 列。
* lg/xl：Hero 文字 + 图片左右分栏，礼服卡片 3 列；内容区域保持 1200px 中央。

### 9.2 可访问性

综合常见 UI 设计 & 无障碍指南的建议：颜色对比、文本大小、可点击区域等，都要符合基本可读性。([UX Collective][3])

最低要求：

* 正文字号 ≥ 14px（1k+ 单价的客户不需要被“极小字”折磨）。
* 主要按钮点击区域高度 ≥ 44px，宽度 ≥ 120px。
* 文本与背景对比度：

  * 主文案：尽量接近 7:1
  * 次要文本也至少 4.5:1。
* 所有核心操作可通过键盘访问（Tab 顺序合理）。

---

## 10. 页面模块级规范（按你这个单页来拆）

给设计师的“模块模板”：

1. **Hero Section**

   * 背景：`color.bg.hero` + 右侧斜切块 + Three.js 背景
   * 主标题：`font.size.4xl`，`font.weight.semib`
   * 副标题：`font.size.md`，`line.height.loose`
   * 主按钮：`button.primary`，次按钮：`button.ghost`
   * 下方可加一行“价格区间 & 服务类型”简要说明。

2. **卖点三列区**

   * 背景：`color.bg.section.alt`
   * 每列用 `card` 形式：

     * 小 icon：线性图标 + 金色描边
     * 标题：`font.size.lg`
     * 描述：不超过 2 行

3. **热门礼服列表区**

   * 背景：`color.bg.page`
   * 标题左对齐，右上角可做简单筛选 chips（`radius.pill`）。
   * 礼服卡片遵循 `Card.Gown` 规范。

4. **场景故事区**

   * 使用交错的 `SlantedBlock`：

     * Section A：左文右图
     * Section B：右文左图
   * 每块场景图使用真实场景（婚礼/年会/酒会）。

5. **顾客出片墙**

   * 小型瀑布流或横向滑动画廊。
   * 每张照片带城市+场景标签。

6. **流程区**

   * 横向 4 步 timeline，使用 icon + 文本组合。
   * 连接线可以使用细金色线条增强“仪式感”。

7. **FAQ + 联系/预约**

   * FAQ 用手风琴折叠组件；
   * 下方大块紫色斜切背景区做强 CTA（预约/咨询）：

---


[1]: https://www.contentful.com/blog/design-token-system/?utm_source=chatgpt.com "Design tokens explained (and how to build a ..."
[2]: https://owdt.com/insight/luxury-color-palette/?utm_source=chatgpt.com "Luxury color palette for web design: Boost visual ... - OWDT"
[3]: https://uxdesign.cc/designing-a-scalable-and-accessible-color-system-for-your-design-system-f98207eda166?utm_source=chatgpt.com "Designing a scalable and accessible color system for your ..."
[4]: https://www.monotype.com/resources/expertise/fonts-and-luxury-brands-fashion?utm_source=chatgpt.com "Fonts and luxury brands: Fashion."
[5]: https://dev.to/marcelluscaio/using-rem-doesnt-make-your-website-responsive-heres-why-4b0e?utm_source=chatgpt.com "Using REM Doesn't Make Your Website Responsive"
[6]: https://atlassian.design/foundations/spacing?utm_source=chatgpt.com "Overview - Spacing"
[7]: https://www.designveloper.com/blog/luxurious-websites/?utm_source=chatgpt.com "10 Luxurious Websites for Your Design Inspiration in 2025"
[8]: https://gsap.com/docs/v3/Plugins/ScrollTrigger/?utm_source=chatgpt.com "ScrollTrigger | GSAP | Docs & Learning"
[9]: https://gsap.com/community/forums/topic/28279-best-practices-with-gsap-and-scrolltrigger/?utm_source=chatgpt.com "Best practices with Gsap and ScrollTrigger"
[10]: https://threejs.org/examples/?utm_source=chatgpt.com "Examples"
[11]: https://www.designsystemscollective.com/the-evolution-of-design-system-tokens-a-2025-deep-dive-into-next-generation-figma-structures-969be68adfbe?utm_source=chatgpt.com "The Evolution of Design System Tokens: A 2025 Deep ..."
