<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const isNavCompacted = ref(false)

let scrollHandler: (() => void) | null = null

onMounted(() => {
    if (typeof window === 'undefined') return

    scrollHandler = () => {
        isNavCompacted.value = window.scrollY > 30
    }

    scrollHandler()
    window.addEventListener('scroll', scrollHandler, { passive: true })
})

onBeforeUnmount(() => {
    if (typeof window !== 'undefined' && scrollHandler) {
        window.removeEventListener('scroll', scrollHandler)
    }
    scrollHandler = null
})
</script>

<template>
    <div class="site-root min-h-screen bg-atelier text-charcoal">
        <nav :class="[
            'lens-nav fixed top-0 w-full z-50 px-6 md:px-10 flex justify-between items-center transition-all duration-300',
            isNavCompacted ? 'py-3 lens-nav--compact' : 'py-5'
        ]">
            <RouterLink :to="{ name: 'home' }" class="lens-nav__brand nav-link">
                NOIR & ÉCLAT
                <span>WHITE PHANTOM</span>
            </RouterLink>
            <div class="lens-nav__links">
                <RouterLink :to="{ name: 'home', hash: '#gallery' }" class="nav-link">Gallery</RouterLink>
                <RouterLink :to="{ name: 'home', hash: '#atelier' }" class="nav-link">Atelier</RouterLink>
                <RouterLink :to="{ name: 'home', hash: '#couture' }" class="nav-link">Couture</RouterLink>
                <RouterLink :to="{ name: 'home', hash: '#contact' }" class="nav-link">Contact</RouterLink>
            </div>
            <button class="nav-ghost nav-link" type="button">预约私享厅</button>
        </nav>

        <slot />

        <footer class="site-footer">
            <div class="site-footer__glow" aria-hidden="true"></div>
            <p class="eyebrow">BY APPOINTMENT ONLY</p>
            <h2 class="text-3xl md:text-5xl font-serif tracking-[0.3em] mt-4">WHITE PHANTOM</h2>
            <div class="site-footer__links mt-6">
                <a href="#" class="nav-link">Instagram</a>
                <span>•</span>
                <a href="#" class="nav-link">WeChat</a>
                <span>•</span>
                <a href="#" class="nav-link">Email</a>
            </div>
            <p class="site-footer__legal">© 2025 NOIR & ÉCLAT · PARIS / SHANGHAI</p>
        </footer>
    </div>
</template>
