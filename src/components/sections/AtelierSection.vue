<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()

const timeline = computed(() => tm('atelier.timeline') as { title: string; desc: string }[])
const meta = computed(() => tm('atelier.meta') as string[])
const pills = computed(() => tm('atelier.pills') as Record<string, string>)
</script>

<template>
    <section id="atelier" class="section-block atelier-section">
        <div class="page-shell">
            <div class="section-heading">
                <div>
                    <p class="eyebrow">{{ t('atelier.eyebrow') }}</p>
                    <h2 class="text-2xl md:text-4xl font-serif">{{ t('atelier.title') }}</h2>
                </div>
                <p class="section-heading__lede">
                    {{ t('atelier.lede') }}
                </p>
            </div>

            <div class="atelier-grid">
                <article class="atelier-panel project-item">
                    <h3 class="text-xl font-serif mb-6">{{ t('atelier.routineTitle') }}</h3>
                    <ul class="atelier-list">
                        <li v-for="item in timeline" :key="item.title">
                            <strong>{{ item.title }}</strong>
                            <span>{{ item.desc }}</span>
                        </li>
                    </ul>
                    <div class="atelier-meta">
                        <div v-for="item in meta" :key="item" class="atelier-meta__item">{{ item }}</div>
                    </div>
                </article>

                <article class="atelier-panel project-item">
                    <h3 class="text-xl font-serif mb-4">{{ t('atelier.materialLabTitle') }}</h3>
                    <p class="text-sm text-stone leading-relaxed">
                        {{ t('atelier.materialLabCopy') }}
                    </p>
                    <div class="hero-pill-group mt-6">
                        <div class="hero-pill">
                            <span class="hero-pill__label">reflectance</span>
                            <span class="hero-pill__value">{{ pills.reflectance }}</span>
                        </div>
                        <div class="hero-pill">
                            <span class="hero-pill__label">roughness</span>
                            <span class="hero-pill__value">{{ pills.roughness }}</span>
                        </div>
                    </div>
                    <div class="hero-pill-group mt-4">
                        <div class="hero-pill">
                            <span class="hero-pill__label">color drift</span>
                            <span class="hero-pill__value">{{ pills.colorDrift }}</span>
                        </div>
                        <div class="hero-pill">
                            <span class="hero-pill__label">wind profile</span>
                            <span class="hero-pill__value">{{ pills.windProfile }}</span>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>
