<template>
    <div class="min-h-screen bg-atelier text-charcoal flex items-center justify-center px-6">
        <div class="max-w-xl w-full">
            <div
                class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-6 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                <p class="eyebrow">PREVIEW MODE</p>
                <h1 class="text-2xl md:text-4xl font-serif mt-3">网站还在开发中</h1>
                <p class="text-stone leading-relaxed mt-4">
                    当前站点处于开发预览模式，请稍后再来。
                </p>
                <div class="mt-6 flex flex-wrap gap-3">
                    <a class="hero-button hero-button--secondary nav-link" href="/" aria-label="刷新页面">
                        刷新页面
                    </a>
                    <span class="text-xs text-stone/80 self-center">
                        将 <code class="px-1 py-0.5 rounded bg-black/10">VITE_PREVIEW</code> 设为 <code
                            class="px-1 py-0.5 rounded bg-black/10">false</code> 可恢复正常内容
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
