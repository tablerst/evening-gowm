<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <section id="seasonal" class="py-12 border-b border-border bg-white">
        <div class="px-4 md:px-8 mb-6 flex justify-between items-end">
            <h2 class="text-2xl font-display uppercase tracking-wider">{{ t('seasonal.title') }}</h2>
            <span class="font-mono text-sm text-gray-500">{{ t('seasonal.season') }}</span>
        </div>
        <div class="overflow-x-auto flex gap-4 px-4 md:px-8 pb-4 snap-x scrollbar-hide">
            <!-- Items -->
            <div v-for="i in 5" :key="i" class="min-w-[280px] md:min-w-[360px] snap-center group cursor-pointer">
                <div class="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                    <img :src="`https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3`"
                        class="w-full h-full object-cover filter-cold-drama transition-transform duration-0 group-hover:scale-105" />
                    <div
                        class="absolute inset-0 bg-[#000226] opacity-0 group-hover:opacity-20 transition-opacity duration-0 mix-blend-multiply">
                    </div>
                </div>
                <div class="mt-3 flex justify-between font-mono text-sm border-t border-black pt-2">
                    <span class="font-bold">{{ t('seasonal.series', { index: i }) }}</span>
                    <span class="text-brand">{{ t('seasonal.lookbook') }}</span>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.filter-cold-drama {
    filter: contrast(95%) brightness(105%) saturate(80%);
    /* 移除 hue-rotate(180deg) 以恢复正常肤色 */
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
