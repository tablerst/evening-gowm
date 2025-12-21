<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <section id="contact" class="grid md:grid-cols-2 lg:grid-cols-4 border-t border-border bg-border gap-[1px]">
        <!-- Designer -->
        <div class="bg-white p-8 md:p-12 flex flex-col justify-between">
            <div>
                <h3 class="font-display text-xl mb-6 uppercase tracking-wider">{{ t('info.designerTitle') }}</h3>
                <p class="font-body text-sm leading-relaxed mb-8 text-gray-800">
                    {{ t('info.designerBody') }}
                </p>
            </div>
            <span class="font-mono text-xs uppercase tracking-wider text-gray-500 block mt-auto">{{
                t('info.designerSign') }}</span>
        </div>

        <!-- Appointment -->
        <div class="bg-white p-8 md:p-12 flex flex-col justify-between">
            <div>
                <h3 class="font-display text-xl mb-6 uppercase tracking-wider">{{ t('info.appointmentTitle') }}</h3>
                <p class="font-body text-sm leading-relaxed mb-8 text-gray-800">
                    {{ t('info.appointmentBody') }}
                </p>
            </div>
            <button
                class="w-full py-4 bg-brand text-white font-mono text-sm hover:bg-black transition-none uppercase tracking-widest mt-auto">
                {{ t('info.appointmentCta') }}
            </button>
        </div>

        <!-- Brand -->
        <div class="bg-white p-8 md:p-12 flex flex-col justify-between">
            <div>
                <h3 class="font-display text-xl mb-6 uppercase tracking-wider">{{ t('info.brandTitle') }}</h3>
                <ul class="font-mono text-sm space-y-4 text-gray-800">
                    <li class="flex justify-between border-b border-gray-100 pb-2"><span>{{ t('info.brandStats.est')
                            }}</span><span>{{ t('info.brandStats.estValue') }}</span>
                    </li>
                    <li class="flex justify-between border-b border-gray-100 pb-2"><span>{{ t('info.brandStats.hq')
                            }}</span><span>{{ t('info.brandStats.hqValue') }}</span>
                    </li>
                    <li class="flex justify-between border-b border-gray-100 pb-2"><span>{{
                        t('info.brandStats.clients')
                            }}</span><span>{{ t('info.brandStats.clientsValue') }}</span></li>
                    <li class="flex justify-between border-b border-gray-100 pb-2">
                        <span>{{ t('info.brandStats.capacity') }}</span><span>{{ t('info.brandStats.capacityValue')
                            }}</span>
                    </li>
                </ul>
            </div>
        </div>

        <!-- GIS / Map -->
        <div class="bg-white relative overflow-hidden group min-h-[300px]">
            <!-- Grid Background -->
            <div class="absolute inset-0 opacity-10"
                style="background-image: linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px); background-size: 40px 40px;">
            </div>

            <!-- Radar/Sonar Effect -->
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-64 h-64 border border-black/10 rounded-full animate-pulse"></div>
                <div class="absolute w-48 h-48 border border-black/20 rounded-full"></div>
                <div class="absolute w-2 h-2 bg-black rounded-full"></div>
                <!-- Crosshair lines -->
                <div class="absolute w-full h-[1px] bg-black/10"></div>
                <div class="absolute h-full w-[1px] bg-black/10"></div>
            </div>

            <!-- Content Overlay -->
            <div class="relative z-10 h-full p-8 md:p-12 flex flex-col justify-between pointer-events-none">
                <div>
                    <h3 class="font-display text-xl mb-2 uppercase tracking-wider text-black">{{ t('info.gisTitle') }}
                    </h3>
                    <p class="font-mono text-xs text-gray-500">{{ t('info.gisStatus') }}</p>
                </div>

                <div class="font-mono text-sm">
                    <div class="mb-1 text-gray-600">{{ t('info.gisLocation') }}</div>
                    <div class="text-black tracking-wider">{{ t('info.gisCoordinates') }}</div>
                </div>
            </div>
        </div>
    </section>
</template>
