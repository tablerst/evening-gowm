<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <section id="contact" class="grid md:grid-cols-3 border-t border-border bg-white">
        <!-- Designer -->
        <div class="p-8 md:p-12 border-r border-border flex flex-col justify-between">
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
        <div class="p-8 md:p-12 border-r border-border flex flex-col justify-between">
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
        <div class="p-8 md:p-12 flex flex-col justify-between">
            <div>
                <h3 class="font-display text-xl mb-6 uppercase tracking-wider">{{ t('info.brandTitle') }}</h3>
                <ul class="font-mono text-sm space-y-4 text-gray-800">
                    <li class="flex justify-between border-b border-gray-100 pb-2"><span>{{ t('info.brandStats.est')
                    }}</span><span>{{ t('info.brandStats.estValue') }}</span>
                    </li>
                    <li class="flex justify-between border-b border-gray-100 pb-2"><span>{{ t('info.brandStats.hq')
                    }}</span><span>{{ t('info.brandStats.hqValue') }}</span>
                    </li>
                    <li class="flex justify-between border-b border-gray-100 pb-2"><span>{{ t('info.brandStats.clients')
                    }}</span><span>{{ t('info.brandStats.clientsValue') }}</span></li>
                    <li class="flex justify-between border-b border-gray-100 pb-2">
                        <span>{{ t('info.brandStats.capacity') }}</span><span>{{ t('info.brandStats.capacityValue')
                        }}</span>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>
