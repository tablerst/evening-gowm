<script setup lang="ts">
import type { ComponentPublicInstance, VNodeRef } from 'vue'

const props = defineProps<{
    onSilkContainerEl: (el: HTMLDivElement | null) => void
    isReducedMotion: boolean
    shouldUseStaticSilk: boolean
}>()

const setSilkContainerEl: VNodeRef = (ref: Element | ComponentPublicInstance | null) => {
    props.onSilkContainerEl(ref instanceof HTMLDivElement ? ref : null)
}
</script>

<template>
    <header class="hero-section pt-28 md:pt-32 relative overflow-hidden" aria-labelledby="hero-title">
        <div class="hero-backdrop absolute inset-0" id="hero-bg" aria-hidden="true">
            <div class="hero-backdrop__wash hero-deco"></div>
            <div class="hero-backdrop__grid hero-deco"></div>
            <div class="hero-backdrop__halo hero-deco"></div>
        </div>

        <div class="hero-shell page-shell">
            <div class="hero-grid">
                <div class="hero-left">
                    <p class="hero-sub eyebrow opacity-0 translate-y-4">
                        THE GALLERY · WHITE PHANTOM
                    </p>
                    <h1 class="hero-title" id="hero-title">
                        <span id="hero-text-1">WHITE</span>
                        <span id="hero-text-2">PHANTOM</span>
                    </h1>
                    <p class="hero-lede">
                        以白中之白的光感重塑晚礼服展厅：玻璃雾面、珠光丝绸与线性 UI
                        律动交织，宛如步入被自然光包裹的 Vernissage 预展。
                        每一次滚动，都解锁不同材质的光亮与肌理。
                    </p>
                    <div class="hero-cta opacity-0">
                        <button class="hero-button hero-button--primary nav-link" type="button">
                            预约预展
                        </button>
                        <button class="hero-button hero-button--secondary nav-link" type="button">
                            下载 Lookbook
                        </button>
                    </div>
                    <div class="hero-pill-group">
                        <div class="hero-pill">
                            <span class="hero-pill__label">atelier cadence</span>
                            <span class="hero-pill__value">900 小时 / 礼服</span>
                        </div>
                        <div class="hero-pill">
                            <span class="hero-pill__label">materials</span>
                            <span class="hero-pill__value">塔夫绸 · 真丝欧根纱</span>
                        </div>
                        <div class="hero-pill">
                            <span class="hero-pill__label">global salons</span>
                            <span class="hero-pill__value">14 城巡回</span>
                        </div>
                    </div>
                </div>

                <div class="hero-right">
                    <div class="hero-note project-item">
                        <div class="hero-note__badge">THE GALLERY</div>
                        <p>
                            通过 Three.js 绘制的白色丝绸在视野中缓慢弯折，模仿厚重面料的
                            菲涅尔色移。GSAP 则负责文字与微交互动效，让 Linear 风格的界面更
                            像一场展览流程表。
                        </p>
                        <div class="hero-note__meta">
                            <span>VOLUME II</span>
                            <span>WHITE PHANTOM</span>
                            <span>2025</span>
                        </div>
                    </div>
                    <div class="hero-visual relative mt-10 lg:mt-12 min-h-[320px] lg:min-h-[520px]">
                        <div class="hero-visual__halo" aria-hidden="true"></div>
                        <div class="hero-visual__frame" aria-hidden="true"></div>
                        <div class="hero-visual__grain" aria-hidden="true"></div>
                        <div class="hero-silk-shell" aria-hidden="true">
                            <div :ref="setSilkContainerEl" class="hero-silk-canvas"></div>
                            <div class="hero-silk-fallback" v-if="isReducedMotion || shouldUseStaticSilk">
                                <div class="hero-silk-fallback__glow"></div>
                            </div>
                        </div>
                        <div class="hero-scroll project-text-reveal">
                            <span>Scroll</span>
                            <span>White Phantom</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>
