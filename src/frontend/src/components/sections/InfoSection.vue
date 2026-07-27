<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ContactModal from '@/components/ContactModal.vue'
import HuqiuStaticMap from '@/components/HuqiuStaticMap.vue'

const { t } = useI18n()

const isContactModalOpen = ref(false)
</script>

<template>
    <section id="contact" class="grid md:grid-cols-2 lg:grid-cols-4 border-t border-border bg-border gap-[1px]">
        <!-- Designer -->
        <div
            class="bg-white p-8 md:p-12 flex flex-col justify-between group hover:bg-gray-50 transition-colors duration-500">
            <div>
                <h3 class="font-display text-2xl mb-8 uppercase tracking-[0.15em] font-bold text-black">{{
                    t('info.designerTitle') }}</h3>
                <p class="font-sans text-sm leading-8 mb-10 text-black/80 text-justify">
                    {{ t('info.designerBody') }}
                </p>
            </div>
            <div class="mt-auto pt-6 border-t border-black/5">
                <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-black block">{{
                    t('info.designerSign') }}</span>
            </div>
        </div>

        <!-- Appointment -->
        <div
            class="bg-white p-8 md:p-12 flex flex-col justify-between group hover:bg-gray-50 transition-colors duration-500">
            <div>
                <h3 class="font-display text-2xl mb-8 uppercase tracking-[0.15em] font-bold text-black">{{
                    t('info.appointmentTitle') }}</h3>
                <p class="font-sans text-sm leading-8 mb-10 text-black/80">
                    {{ t('info.appointmentBody') }}
                </p>
            </div>

            <div class="mt-auto">
                <button type="button" @click="isContactModalOpen = true"
                    class="w-full h-12 bg-brand text-white font-mono text-xs hover:bg-black transition-colors duration-300 uppercase tracking-[0.25em] flex items-center justify-center">
                    {{ t('info.appointmentCta') }}
                </button>
            </div>
        </div>

        <!-- Brand -->
        <div
            class="bg-white p-8 md:p-12 flex flex-col justify-between group hover:bg-gray-50 transition-colors duration-500">
            <div>
                <h3 class="font-display text-2xl mb-8 uppercase tracking-[0.15em] font-bold text-black">{{
                    t('info.brandTitle') }}</h3>
                <ul class="font-mono text-sm space-y-0">
                    <li class="flex justify-between items-center border-b border-black/10 py-4 first:border-t">
                        <span class="text-[10px] uppercase tracking-[0.15em] text-black/50">{{ t('info.brandStats.est')
                            }}</span>
                        <span class="font-bold text-black">{{ t('info.brandStats.estValue') }}</span>
                    </li>
                    <li class="flex justify-between items-center border-b border-black/10 py-4">
                        <span class="text-[10px] uppercase tracking-[0.15em] text-black/50">{{ t('info.brandStats.hq')
                            }}</span>
                        <span class="font-bold text-black">{{ t('info.brandStats.hqValue') }}</span>
                    </li>
                    <li class="flex justify-between items-center border-b border-black/10 py-4">
                        <span class="text-[10px] uppercase tracking-[0.15em] text-black/50">{{
                            t('info.brandStats.clients') }}</span>
                        <span class="font-bold text-black">{{ t('info.brandStats.clientsValue') }}</span>
                    </li>
                    <li class="flex justify-between items-center border-b border-black/10 py-4">
                        <span class="text-[10px] uppercase tracking-[0.15em] text-black/50">{{
                            t('info.brandStats.capacity') }}</span>
                        <span class="font-bold text-black">{{ t('info.brandStats.capacityValue') }}</span>
                    </li>
                </ul>
            </div>
        </div>

        <!-- GIS / Map -->
        <HuqiuStaticMap />
    </section>
    <ContactModal v-model="isContactModalOpen" />
</template>
