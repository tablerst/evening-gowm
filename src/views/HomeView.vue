<script setup lang="ts">
import HeroSection from '@/components/sections/HeroSection.vue'
import TickerSection from '@/components/sections/TickerSection.vue'
import SeasonalSection from '@/components/sections/SeasonalSection.vue'
import ProductGridSection from '@/components/sections/ProductGridSection.vue'
import InfoSection from '@/components/sections/InfoSection.vue'
</script>

<template>
    <main class="bg-white min-h-screen">
        <HeroSection />
        <TickerSection />
        <SeasonalSection />
        <ProductGridSection />
        <InfoSection />
    </main>
</template>
