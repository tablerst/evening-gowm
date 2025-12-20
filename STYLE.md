# **晚礼服 B2B 官网风格规范 (Style Guide) - Ver 3.0**

**主题代号**：Midnight Geometry / 午夜几何

**美学基石**：Tri-Chromatic (三色原则)、Flat Design (绝对平面)、Cyan Shift (青色偏移)

**设计目标**：建立“稳定高质量供应商”的视觉权威，服务于高效率的 B2B 批发场景。

---

## **1. 色彩体系 (Color Palette)**

严格遵循“全站不超过三种颜色（商品除外）”的硬性约束 。所有的色彩选择旨在剥离情感，强调秩序与精确。

### **1.1 核心三色 (The Triad)**

| 角色 | 色彩命名 | Hex / RGBA | 描述与 B2B 隐喻 |
| --- | --- | --- | --- |
| **画布** | **Absolute White (绝对白)** | `#FFFFFF` | <br>**禁用 #F9F9F9**。背景必须是纯白，以提供最高的对比度基准，营造“无菌”的展示环境 。

 |
| **骨架** | **Structure Black (结构黑)** | `#000000` | <br>**禁用 #1A1A1A**。回归纯黑，用于文字、线条和图标。象征工业图纸的墨线 。

 |
| **品牌** | **Midnight Abyss (午夜深渊)** | `#000226` | 唯一的彩色。极深的藏青色，仅用于强调交互（Hover）、价格与 CTA 按钮。象征皇室尊贵与商业稳重 。 |

### **1.2 辅助功能色 (Utility)**

即使是辅助色，也必须剔除暖色倾向，保持冷峻基调。

| 角色 | 色彩命名 | Hex / RGBA | 用途 |
| --- | --- | --- | --- |
| **分割线** | **Cool Slate (冷岩灰)** | `#E2E8F0` | 用于表格线、边框。带有微量的蓝色倾向，而非中性灰 。

 |
| **禁用态** | **Steel Vapor (钢汽)** | `#CBD5E0` | 用于不可点击的按钮或缺货状态。 |
| **错误/警示** | **Signal Red** | `#BF0000` | 保持高饱和度，类似于工业仪表盘的警示灯。 |

---

## **2. 字体与排版 (Typography)**

从“文学性”转向“数据性”。字体组合旨在模仿时尚杂志的权威感与物流清单的清晰度。

### **2.1 字体家族 (Font Family)**

* **Display (标题/品牌)**: **Bodoni Moda** (All Caps / 全大写)
* *特征*：极高的粗细对比度，锐利的衬线。
* *应用*：Hero Slogan, 版块标题 (Level 1 & 2)。
* 
*理由*：建立类似于 Gucci 的时尚权威感，全大写增加建筑般的庄重 。




* **Body (正文/界面)**: **Inter**
* *特征*：中性、现代、屏幕阅读优化。
* *应用*：导航、正文说明、表单标签。
* 
*理由*：剔除情感色彩，确保信息传达的绝对清晰 。




* **Data (数据/参数)**: **JetBrains Mono** 或 **DIN**
* *特征*：等宽 (Monospace) 或 工业无衬线。
* *应用*：**Style No. (款号)**, **Price (批发价)**, 尺码表, 订单清单。
* 
*理由*：赋予 B2B 交易数据一种“代码编辑器”或“规格说明书”的专业美学 。





### **2.2 排版规范 (Typescale)**

* **Page Title**: 64px | Bodoni Moda | Regular | Uppercase | Letter-spacing +2px
* **Section Head**: 24px | Inter | Bold | Uppercase | Color: #000226
* **Product ID**: 12px | JetBrains Mono | Regular | Color: #000000
* **Price Tag**: 14px | JetBrains Mono | Bold | Color: #000226

---

## **3. 材质与几何 (Materials & Geometry)**

### **3.1 形状规则：锐利几何 (Sharp Geometry)**

* **Border-Radius**: **0px (Global Mandatory)**。
* 所有的卡片、按钮、输入框、图片容器必须是直角。
* *理由*：圆角是友好的；直角是严谨的、成年的、反妥协的 。



### **3.2 表面质感：去材质化 (De-materialization)**

* **禁止**：毛玻璃 (Glassmorphism)、渐变 (Gradients)、投影 (Drop Shadows) 。
* **启用**：
* **1px Stroke**: 使用极细的实线描边来界定空间。
* **Solid Fill**: 纯色填充。Hover 状态通过颜色的瞬间反转（黑底变蓝底）来反馈，而非上浮或发光。



---

## **4. 影像风格与滤镜 (Imagery & Filters)**

### **4.1 摄影风格：工业冷调**

* **主题**：工厂实拍、大光圈虚化、模特去底 (Cutout)。
* **光线**：高调 (High-Key) 但不暖，强调自然冷光。

### **4.2 CSS 滤镜配方：日系冷剧 (Japanese Cold Drama)**

直接通过 CSS 代码统一全站图片的色调，无需手动修图，确保“日剧滤镜”风格的一致性 。

```css
/* 应用于 Hero Video 和 氛围图 */
.filter-cold-tone {
    filter: 
        contrast(95%)       /* 略微降低对比度，模拟胶片 */
        brightness(105%)    /* 提高亮度，通透感 */
        saturate(85%)       /* 降低饱和度，去燥 */
        sepia(10%)          /* 极少量的复古色 */
        hue-rotate(180deg); /* 关键：青色偏移 (Cyan Shift) */
}

/* 配合 mix-blend-mode 实现暗部偏蓝 */
.filter-overlay {
    background: rgba(0, 2, 38, 0.1); /* Midnight Abyss with low opacity */
    mix-blend-mode: multiply;
}

```

*此配方旨在压低肤色中的暖黄，提升高光部分的青绿感，营造疏离、高级的视觉氛围*。

---

## **5. 交互动效 (Motion)**

* **类型**：**Hard Cut (硬切)**。
* **Transition**: `all 0s` 或 `all 0.1s cubic-bezier(0, 1, 0, 1)`。
* **描述**：避免任何形式的淡入淡出 (Fade-in) 或 缓动 (Easing)。B2B 的操作应当像开关灯一样干脆利落。
* *Hover*: 瞬间变色。
* *Modal*: 瞬间弹出。


* **Marquee**: 资讯栏使用匀速线性滚动 (Linear Infinite Scroll)，模拟股票大屏。

---

## **6. 开发变量参考 (Design Tokens)**

```css
:root {
    /* Color System */
    --color-canvas:        #FFFFFF;
    --color-structure:     #000000;
    --color-brand:         #000226; /* Midnight Abyss */
    --color-border:        #E2E8F0; /* Cool Slate */
    
    /* Typography */
    --font-display:        'Bodoni Moda', serif;
    --font-body:           'Inter', sans-serif;
    --font-mono:           'JetBrains Mono', monospace;
    
    /* Geometry */
    --radius-global:       0px;
    --border-width:        1px;
    
    /* Filters */
    --filter-drama:        contrast(95%) brightness(105%) saturate(85%) hue-rotate(180deg);
}