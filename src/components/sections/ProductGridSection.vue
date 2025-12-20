<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <section class="py-12 bg-white">
        <div class="px-4 md:px-8 mb-8 sticky top-0 bg-white z-10 py-4 border-b border-border">
            <div class="flex justify-between items-end">
                <h2 class="text-2xl font-display uppercase tracking-wider">{{ t('product.title') }}</h2>
                <div class="flex gap-6 font-mono text-sm text-gray-500">
                    <span>{{ t('product.total', { count: 42 }) }}</span>
                    <span>{{ t('product.filter') }}</span>
                    <span>{{ t('product.sort') }}</span>
                </div>
            </div>
        </div>

        <div
            class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-[1px] bg-border border-t border-border px-4 md:px-8">
            <div v-for="i in 10" :key="i"
                class="group relative bg-white aspect-[3/5] overflow-hidden border border-transparent hover:border-brand transition-colors duration-0">
                <!-- Default Image -->
                <img :src="`https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop`"
                    class="w-full h-full object-cover block group-hover:hidden filter-cold-drama" />

                <!-- Hover Detail (Simulated with another image or zoom) -->
                <img :src="`https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop`"
                    class="w-full h-full object-cover hidden group-hover:block scale-110 filter-cold-drama" />

                <div
                    class="absolute bottom-0 left-0 right-0 p-2 bg-white/95 font-mono text-xs flex justify-between items-center border-t border-border">
                    <div class="flex flex-col">
                        <span class="font-bold text-black">{{ t('product.style', { id: 2000 + i }) }}</span>
                        <span class="text-brand font-bold mt-1">{{ t('product.login') }}</span>
                    </div>
                    <button
                        class="w-8 h-8 border border-black flex items-center justify-center hover:bg-brand hover:text-white transition-none text-lg"
                        :aria-label="t('product.add')">
                        +
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.filter-cold-drama {
    filter: contrast(95%) brightness(105%) saturate(80%);
    /* 移除 hue-rotate(180deg) 以恢复正常肤色，保留低饱和度冷感 */
}
</style>
