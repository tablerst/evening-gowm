<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'

const route = useRoute()

const layoutComponent = computed(() => {
    return route.meta.layout === 'blank' ? BlankLayout : DefaultLayout
})
</script>

<template>
    <component :is="layoutComponent">
        <RouterView />
    </component>
</template>
