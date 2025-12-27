<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type MetricsDay = {
    date: string
    total: number
    byType: Record<string, number>
}

const props = withDefaults(
    defineProps<{
        title?: string
        tz?: string
        series: MetricsDay[]
        loading?: boolean
        height?: string
    }>(),
    {
        title: '',
        tz: 'UTC',
        loading: false,
        height: '260px',
    }
)

const elRef = ref<HTMLDivElement | null>(null)
let chart: any | null = null
let removeResize: (() => void) | null = null

// Business semantics: darker == more important.
// Lower number => higher priority (darker, earlier in legend/stack).
const typePriority: Record<string, number> = {
    poster_generated: 0,
    view: 1,
}

const rankType = (t: string) => {
    const v = typePriority[t]
    return typeof v === 'number' ? v : 999
}

const types = computed(() => {
    const set = new Set<string>()
    for (const d of props.series) {
        for (const k of Object.keys(d.byType || {})) set.add(k)
    }
    return Array.from(set).sort((a, b) => {
        const ra = rankType(a)
        const rb = rankType(b)
        if (ra !== rb) return ra - rb
        return a.localeCompare(b)
    })
})

const categories = computed(() => props.series.map((d) => d.date))

const monoFont =
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

const hashString = (s: string) => {
    // Deterministic, fast, good-enough for stable color assignment.
    let h = 2166136261
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return h >>> 0
}

const typeToGray = (type: string) => {
    // “Same hue, different lightness”: consistent per event_type and stays on-theme.
    // Business semantics first, then fall back to a stable palette for the rest.
    if (type === 'poster_generated') return 'hsla(220, 10%, 24%, 0.92)'
    if (type === 'view') return 'hsla(220, 9%, 38%, 0.90)'

    // Remaining types: keep lighter than `view`, but still distinguishable.
    // Pick from a fixed lightness palette so different types are visibly different,
    // while staying in a coherent grayscale family.
    const palette = [52, 58, 64, 70, 74] // lightness (%), all > view
    const idx = hashString(type) % palette.length
    return `hsla(220, 8%, ${palette[idx]}%, 0.88)`
}

const chartColors = {
    total: '#111827', // charcoal
    text: 'rgba(0,0,0,0.62)',
    subtleText: 'rgba(0,0,0,0.50)',
    axisLine: 'rgba(0,0,0,0.22)',
    gridLine: 'rgba(0,0,0,0.08)',
    tooltipBg: 'rgba(255,255,255,0.96)',
    tooltipBorder: 'rgba(0,0,0,0.12)',
    hoverBand: 'rgba(17,24,39,0.06)',
}

const buildOption = () => {
    const seriesByType = types.value.map((t) => ({
        name: t,
        type: 'bar',
        stack: 'events',
        emphasis: { focus: 'series' },
        itemStyle: {
            color: typeToGray(t),
            borderColor: 'rgba(17,24,39,0.22)',
            borderWidth: 1,
        },
        data: props.series.map((d) => (d.byType && typeof d.byType[t] === 'number' ? d.byType[t] : 0)),
    }))

    const totalLine = {
        name: 'total',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        yAxisIndex: 0,
        lineStyle: { color: chartColors.total, width: 2 },
        itemStyle: { color: chartColors.total },
        data: props.series.map((d) => d.total ?? 0),
    }

    return {
        backgroundColor: 'transparent',
        textStyle: {
            fontFamily: monoFont,
            color: chartColors.text,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow', shadowStyle: { color: chartColors.hoverBand } },
            backgroundColor: chartColors.tooltipBg,
            borderColor: chartColors.tooltipBorder,
            borderWidth: 1,
            textStyle: { fontFamily: monoFont, color: '#111827', fontSize: 12 },
            extraCssText: 'box-shadow: 0 10px 30px rgba(0,0,0,0.10);',
        },
        legend: {
            top: 0,
            left: 0,
            itemWidth: 10,
            itemHeight: 10,
            textStyle: { fontFamily: monoFont, fontSize: 11, color: chartColors.subtleText },
        },
        grid: { left: 36, right: 16, top: 40, bottom: 28 },
        xAxis: {
            type: 'category',
            data: categories.value,
            axisLabel: { fontSize: 10, color: chartColors.subtleText },
            axisLine: { lineStyle: { color: chartColors.axisLine } },
            axisTick: { lineStyle: { color: chartColors.axisLine } },
        },
        yAxis: {
            type: 'value',
            axisLabel: { fontSize: 10, color: chartColors.subtleText },
            axisLine: { lineStyle: { color: chartColors.axisLine } },
            axisTick: { lineStyle: { color: chartColors.axisLine } },
            splitLine: { lineStyle: { color: chartColors.gridLine } },
        },
        series: [...seriesByType, totalLine],
    }
}

const render = async () => {
    if (!elRef.value) return
    const echarts = await import('echarts')

    if (!chart) {
        chart = echarts.init(elRef.value)
    }

    chart.setOption(buildOption(), { notMerge: true })
    chart.resize()
}

const dispose = () => {
    if (removeResize) removeResize()
    removeResize = null

    if (chart) {
        chart.dispose()
        chart = null
    }
}

onMounted(() => {
    void render()

    const onResize = () => {
        chart?.resize?.()
    }
    window.addEventListener('resize', onResize, { passive: true })
    removeResize = () => window.removeEventListener('resize', onResize)
})

onBeforeUnmount(() => {
    dispose()
})

watch(
    () => props.series,
    () => {
        void render()
    },
    { deep: true }
)
</script>

<template>
    <div class="border border-border p-4">
        <div class="flex items-center justify-between gap-4">
            <div>
                <div class="font-mono text-xs uppercase tracking-[0.25em] text-black/50">{{ title }}</div>
                <div class="mt-1 font-mono text-[11px] text-black/50">TZ: {{ tz }}</div>
            </div>
            <div v-if="loading" class="font-mono text-xs text-black/50">Loading…</div>
        </div>

        <div class="mt-3" :style="{ height }" ref="elRef" />

        <div v-if="!loading && series.length === 0" class="mt-3 font-mono text-xs text-black/50">
            No data
        </div>
    </div>
</template>
