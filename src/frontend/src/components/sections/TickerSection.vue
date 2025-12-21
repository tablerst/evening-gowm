<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const tickerItems = computed(() => [
    t('ticker.release'),
    t('ticker.fashionWeek'),
    t('ticker.leadTime'),
    t('ticker.release'),
    t('ticker.fashionWeek'),
    t('ticker.leadTime'),
])
</script>

<template>
    <div class="ticker-wrap bg-brand text-white overflow-hidden py-2 border-b border-white/10">
        <div class="ticker">
            <div v-for="(item, index) in tickerItems" :key="index"
                class="ticker__item inline-block px-4 font-mono text-sm">
                {{ item }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.ticker-wrap {
    width: 100%;
    background-color: #000226;
    /* Midnight Abyss */
}

.ticker {
    white-space: nowrap;
    animation: ticker 30s linear infinite;
}

.ticker__item {
    display: inline-block;
}

@keyframes ticker {
    0% {
        transform: translate3d(0, 0, 0);
    }

    100% {
        transform: translate3d(-50%, 0, 0);
    }
}
</style>
