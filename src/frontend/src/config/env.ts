export type AppEnv = {
    previewMode: boolean
    locale: 'zh' | 'en'
    maxImageUploadBytes: number
    mode: string
    dev: boolean
    prod: boolean
}

const parseBoolean = (value: unknown): boolean => {
    if (typeof value === 'boolean') return value
    if (value === null || value === undefined) return false

    const normalized = String(value).trim().toLowerCase()

    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true
    if (['false', '0', 'no', 'n', 'off', ''].includes(normalized)) return false

    return false
}

const readPreviewFlag = (): unknown => {
    // 规范用法：VITE_PREVIEW（Vite 默认只暴露 VITE_ 前缀）
    // 兼容历史字段：PRE_VIEW（若曾配置过 envPrefix: ['PRE_']）
    const env = import.meta.env as unknown as Record<string, unknown>
    return env.VITE_PREVIEW ?? env.PRE_VIEW
}

const parseLocale = (value: unknown): AppEnv['locale'] => {
    const normalized = String(value ?? '').trim().toLowerCase()

    if (normalized === 'en') return 'en'
    return 'zh'
}

const parseIntNumber = (value: unknown, fallback: number): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.floor(value)
    if (value === null || value === undefined) return fallback

    const raw = String(value).trim()
    const n = Number.parseInt(raw, 10)
    if (!Number.isFinite(n) || Number.isNaN(n)) return fallback
    return n
}

const readMaxImageUploadBytes = (): unknown => {
    const env = import.meta.env as unknown as Record<string, unknown>
    return env.VITE_MAX_IMAGE_UPLOAD_BYTES
}

const readLocaleFlag = (): unknown => {
    const env = import.meta.env as unknown as Record<string, unknown>
    return env.VITE_LOCALE ?? env.PRE_LOCALE
}

export const appEnv: AppEnv = {
    previewMode: parseBoolean(readPreviewFlag()),
    locale: parseLocale(readLocaleFlag()),
    maxImageUploadBytes: parseIntNumber(readMaxImageUploadBytes(), 1048576),
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
}
