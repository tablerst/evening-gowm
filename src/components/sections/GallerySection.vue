<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <section id="gallery" class="section-block gallery-section">
        <div class="page-shell">
            <div class="section-heading">
                <div>
                    <p class="eyebrow">{{ t('gallery.eyebrow') }}</p>
                    <h2 class="text-2xl md:text-4xl font-serif">{{ t('gallery.title') }}</h2>
                </div>
                <p class="section-heading__lede">
                    {{ t('gallery.lede') }}
                </p>
            </div>

            <div class="bento-grid">
                <article class="bento-card bento-card--xl bento-card--media project-item">
                    <div class="bento-card__media" aria-hidden="true">
                        <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1980&auto=format&fit=crop"
                            alt="Architected halo gown" loading="lazy" />
                    </div>
                    <div class="bento-card__meta">
                        <p class="bento-card__caption">{{ t('gallery.cards.halo.caption') }}</p>
                        <h3 class="bento-card__title">{{ t('gallery.cards.halo.title') }}</h3>
                        <p class="bento-card__caption">{{ t('gallery.cards.halo.desc') }}</p>
                    </div>
                </article>

                <article class="bento-card bento-card--tall bento-card--media project-item">
                    <div class="bento-card__media" aria-hidden="true">
                        <img src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop"
                            alt="Hand pleated silk drape" loading="lazy" />
                    </div>
                    <div class="bento-card__meta">
                        <p class="bento-card__caption">{{ t('gallery.cards.pleated.caption') }}</p>
                        <h3 class="bento-card__title">{{ t('gallery.cards.pleated.title') }}</h3>
                        <p class="bento-card__caption">{{ t('gallery.cards.pleated.desc') }}</p>
                    </div>
                </article>

                <article class="bento-card bento-card--wide project-item">
                    <div class="bento-card__meta">
                        <p class="bento-card__caption">{{ t('gallery.cards.flow.caption') }}</p>
                        <h3 class="bento-card__title">{{ t('gallery.cards.flow.title') }}</h3>
                        <p class="text-sm text-stone leading-relaxed">
                            {{ t('gallery.cards.flow.copy') }}
                        </p>
                        <span class="bento-card__tag nav-link">{{ t('gallery.cards.flow.tag') }}</span>
                    </div>
                </article>

                <article class="bento-card bento-card--media project-item">
                    <div class="bento-card__media" aria-hidden="true">
                        <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop"
                            alt="Pearl embroidery detail" loading="lazy" />
                    </div>
                    <div class="bento-card__meta">
                        <p class="bento-card__caption">{{ t('gallery.cards.detail.caption') }}</p>
                        <h3 class="bento-card__title">{{ t('gallery.cards.detail.title') }}</h3>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>
