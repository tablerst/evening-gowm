export type AppEnv = {
    previewMode: boolean
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

export const appEnv: AppEnv = {
    previewMode: parseBoolean(readPreviewFlag()),
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
}
