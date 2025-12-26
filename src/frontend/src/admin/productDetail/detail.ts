import type {
    DetailSection,
    DetailSectionArea,
    I18nText,
    ProductDetailV2,
} from './types'

const asRecord = (v: unknown): Record<string, unknown> | null => {
    if (!v || typeof v !== 'object') return null
    if (Array.isArray(v)) return null
    return v as Record<string, unknown>
}

export const safeParseJsonObject = (
    raw: string,
): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } => {
    try {
        const parsed = JSON.parse(String(raw ?? ''))
        const obj = asRecord(parsed)
        if (!obj) return { ok: false, error: 'detail must be a JSON object' }
        return { ok: true, value: obj }
    } catch {
        return { ok: false, error: 'invalid JSON' }
    }
}

export const stringifyPretty = (v: unknown) => JSON.stringify(v ?? {}, null, 2)

export const randomId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
    return `sec_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export const pickLocalizedText = (v: unknown, locale: string): string => {
    if (typeof v === 'string') return v
    const obj = asRecord(v)
    if (!obj) return ''

    const direct = obj[locale]
    if (typeof direct === 'string' && direct.trim()) return direct

    const zh = obj.zh
    if (typeof zh === 'string' && zh.trim()) return zh

    const en = obj.en
    if (typeof en === 'string' && en.trim()) return en

    return ''
}

export const normalizeI18n = (v: unknown): I18nText | undefined => {
    const obj = asRecord(v)
    if (!obj) return undefined
    const out: I18nText = {}
    if (typeof obj.zh === 'string') out.zh = obj.zh
    if (typeof obj.en === 'string') out.en = obj.en
    return out
}

const defaultSections = (): DetailSection[] => [
    {
        id: randomId(),
        type: 'gallery',
        area: 'media',
        title_i18n: { zh: '画廊', en: 'Gallery' },
        props: { includeCoverHover: true },
    },
    {
        id: randomId(),
        type: 'options',
        area: 'sticky',
        title_i18n: { zh: '可选项', en: 'Options' },
    },
    {
        id: randomId(),
        type: 'richText',
        area: 'main',
        title_i18n: { zh: '概览', en: 'Overview' },
        data: { text_i18n: { zh: '', en: '' } },
    },
    {
        id: randomId(),
        type: 'specs',
        area: 'main',
        title_i18n: { zh: '规格', en: 'Specs' },
    },
    {
        id: randomId(),
        type: 'service',
        area: 'aside',
        title_i18n: { zh: '服务', en: 'Service' },
    },
]

export const isDetailV2 = (v: unknown): v is ProductDetailV2 => {
    const obj = asRecord(v)
    if (!obj) return false
    return Number(obj.schema_version) === 2 && Array.isArray(obj.sections)
}

const ensureArray = (v: unknown) => (Array.isArray(v) ? v : [])

const hasCjk = (s: string) => /[\u4E00-\u9FFF]/.test(s)

const SPEC_LABEL_MAP: Record<string, { key: string; enLabel: string }> = {
    '件数': { key: 'pieces', enLabel: 'Pieces' },
    '交付时间': { key: 'lead_time', enLabel: 'Lead Time' },
    '交期': { key: 'lead_time', enLabel: 'Lead Time' },
}

const OPTION_GROUP_NAME_MAP: Record<string, { key: string; enName: string }> = {
    '颜色': { key: 'color', enName: 'Color' },
    '尺码': { key: 'size', enName: 'Size' },
}

const dedupeKey = (used: Set<string>, preferred: string, fallbackPrefix: string) => {
    const base = String(preferred ?? '').trim() || `${fallbackPrefix}_${used.size + 1}`
    let k = base
    let i = 2
    while (used.has(k)) {
        k = `${base}_${i}`
        i++
    }
    used.add(k)
    return k
}

const normalizeText = (v: unknown) => String(v ?? '').trim()

const normalizeGallery = (raw: unknown) => {
    const arr = ensureArray(raw)
    const out: any[] = []
    for (const it of arr) {
        if (typeof it === 'string') {
            const url = it.trim()
            if (!url) continue
            out.push({ id: randomId(), url })
            continue
        }
        const obj = asRecord(it)
        if (!obj) continue
        // NOTE: keep empty url items (admin builder needs a placeholder row).
        // PDP rendering will ignore empty urls.
        const url = normalizeText(obj.url)
        const objectKey = normalizeText(obj.objectKey)

        // If both url and objectKey are empty, still keep it if it has an id (editing placeholder).
        const id = normalizeText(obj.id) || randomId()

        out.push({
            ...obj,
            id,
            url,
            objectKey: objectKey || undefined,
            alt_i18n: normalizeI18n(obj.alt_i18n),
        })
    }
    return out
}

const normalizeSpecs = (raw: unknown) => {
    const arr = ensureArray(raw)
    const out: any[] = []
    const used = new Set<string>()

    for (const it of arr) {
        const obj = asRecord(it)
        if (!obj) continue

        const legacyLabel = normalizeText(obj.k ?? obj.label ?? obj.name ?? obj.key)
        const legacyValue = normalizeText(obj.v ?? obj.value ?? obj.val)

        const mapped = SPEC_LABEL_MAP[legacyLabel]

        const label_i18n = normalizeI18n(obj.label_i18n) ?? {}
        const value_i18n = normalizeI18n(obj.value_i18n) ?? {}

        if (!label_i18n.zh && legacyLabel) label_i18n.zh = legacyLabel
        if (!label_i18n.en) {
            if (mapped) label_i18n.en = mapped.enLabel
            else if (legacyLabel && !hasCjk(legacyLabel)) label_i18n.en = legacyLabel
        }

        if (!value_i18n.zh && legacyValue) value_i18n.zh = legacyValue
        if (!value_i18n.en && legacyValue && !hasCjk(legacyValue)) value_i18n.en = legacyValue

        const preferredKey = normalizeText(obj.key) || mapped?.key || legacyLabel
        const key = dedupeKey(used, preferredKey, 'spec')

        out.push({
            ...obj,
            key,
            label_i18n,
            value_i18n,
        })
    }

    return out
}

const normalizeOptionGroups = (raw: unknown) => {
    const arr = ensureArray(raw)
    const out: any[] = []
    const usedGroupKeys = new Set<string>()

    for (const it of arr) {
        const obj = asRecord(it)
        if (!obj) continue

        const legacyName = normalizeText(obj.name ?? obj.title ?? obj.label)
        const mapped = OPTION_GROUP_NAME_MAP[legacyName]

        const name_i18n = normalizeI18n(obj.name_i18n) ?? {}
        if (!name_i18n.zh && legacyName) name_i18n.zh = legacyName
        if (!name_i18n.en) {
            if (mapped) name_i18n.en = mapped.enName
            else if (legacyName && !hasCjk(legacyName)) name_i18n.en = legacyName
        }

        const preferredKey = normalizeText(obj.key ?? obj.id) || mapped?.key || legacyName
        const key = dedupeKey(usedGroupKeys, preferredKey, 'group')

        const optionsRaw = obj.options
        const optionsArr = ensureArray(optionsRaw)
        const usedOptionKeys = new Set<string>()
        const options: any[] = []
        for (const opt of optionsArr) {
            if (typeof opt === 'string') {
                const s = opt.trim()
                if (!s) continue
                const optKey = dedupeKey(usedOptionKeys, s, 'opt')
                options.push({ key: optKey, label_i18n: { zh: s, en: s } })
                continue
            }
            const o = asRecord(opt)
            if (!o) continue

            const legacyLabel = normalizeText(o.label ?? o.name ?? o.value)
            const label_i18n = normalizeI18n(o.label_i18n) ?? {}
            if (!label_i18n.zh && legacyLabel) label_i18n.zh = legacyLabel
            if (!label_i18n.en && legacyLabel) label_i18n.en = legacyLabel

            const preferredOptKey = normalizeText(o.key ?? o.id ?? o.value) || legacyLabel
            const optKey = dedupeKey(usedOptionKeys, preferredOptKey, 'opt')
            options.push({ ...o, key: optKey, label_i18n })
        }

        if (!options.length) {
            // Keep empty groups (merchandisers may fill later).
        }

        out.push({
            ...obj,
            key,
            name_i18n,
            options,
        })
    }

    return out
}

const normalizeSectionArea = (raw: unknown): DetailSectionArea => {
    const a = String(raw ?? '').trim()
    if (a === 'media' || a === 'sticky' || a === 'main' || a === 'aside') return a
    return 'main'
}

const normalizeSections = (raw: unknown): DetailSection[] => {
    const arr = ensureArray(raw)
    const out: DetailSection[] = []

    for (const it of arr) {
        const obj = asRecord(it)
        if (!obj) continue

        const type = String(obj.type ?? '').trim()
        if (!type) continue

        const area = normalizeSectionArea(obj.area)
        const id = String(obj.id ?? '').trim() || randomId()
        const title_i18n = normalizeI18n(obj.title_i18n)

        if (type === 'gallery') {
            const propsObj = asRecord(obj.props)
            const rawInclude = propsObj?.includeCoverHover
            const includeCoverHover = rawInclude === false ? false : true
            out.push({
                id,
                type: 'gallery',
                area: 'media',
                title_i18n,
                props: {
                    includeCoverHover,
                },
            })
            continue
        }

        if (type === 'options') {
            out.push({ id, type: 'options', area: 'sticky', title_i18n })
            continue
        }

        if (type === 'specs') {
            out.push({ id, type: 'specs', area: 'main', title_i18n })
            continue
        }

        if (type === 'service') {
            out.push({ id, type: 'service', area: 'aside', title_i18n })
            continue
        }

        if (type === 'divider') {
            out.push({ id, type: 'divider', area: area === 'media' ? 'main' : area, title_i18n })
            continue
        }

        if (type === 'richText') {
            const data = asRecord(obj.data)
            out.push({
                id,
                type: 'richText',
                area: area === 'aside' || area === 'media' ? 'main' : area,
                title_i18n,
                data: {
                    text_i18n: normalizeI18n(data?.text_i18n) ?? { zh: '', en: '' },
                },
            })
            continue
        }

        // Unknown block types are dropped for now (keeps renderer simple).
    }

    // Ensure we always have at least the default skeleton.
    if (!out.length) return defaultSections()

    // Ensure at least one gallery exists (media column depends on it).
    if (!out.some((s) => s.type === 'gallery')) {
        const g = defaultSections()[0]
        if (g) out.unshift(g)
    }

    return out
}

export const ensureDetailV2 = (input: unknown): ProductDetailV2 => {
    const obj = asRecord(input) ?? {}

    if (isDetailV2(input)) {
        return {
            ...(obj as any),
            schema_version: 2,
            gallery: normalizeGallery(obj.gallery),
            specs: normalizeSpecs(obj.specs),
            option_groups: normalizeOptionGroups(obj.option_groups),
            sections: normalizeSections(obj.sections),
        }
    }

    // best-effort migration from legacy structure
    const sections = defaultSections()

    // If legacy description exists, seed it into richText block.
    const legacyDesc = obj.description_i18n ?? obj.description ?? obj.desc_i18n ?? obj.desc
    const rich = sections.find((s) => s.type === 'richText')
    if (rich && rich.type === 'richText') {
        const i18n = normalizeI18n(legacyDesc)
        const zh = typeof legacyDesc === 'string' ? legacyDesc : i18n?.zh ?? ''
        const en = i18n?.en ?? ''
        rich.data = { text_i18n: { zh, en } }
    }

    return {
        ...(obj as any),
        schema_version: 2,
        gallery: normalizeGallery(obj.gallery),
        specs: normalizeSpecs(obj.specs),
        option_groups: normalizeOptionGroups(obj.option_groups),
        sections,
    }
}
