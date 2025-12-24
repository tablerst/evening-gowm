import { HttpError, httpGet, httpPatch, httpPost } from '@/api/http'

const TOKEN_KEY = 'admin_token'
const REFRESH_TOKEN_KEY = 'admin_refresh_token'

export const getAdminToken = () => {
    if (typeof localStorage === 'undefined') return ''
    return localStorage.getItem(TOKEN_KEY) ?? ''
}

export const setAdminToken = (token: string) => {
    if (typeof localStorage === 'undefined') return
    if (!token) localStorage.removeItem(TOKEN_KEY)
    else localStorage.setItem(TOKEN_KEY, token)
}

export const getAdminRefreshToken = () => {
    if (typeof localStorage === 'undefined') return ''
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? ''
}

export const setAdminRefreshToken = (token: string) => {
    if (typeof localStorage === 'undefined') return
    if (!token) localStorage.removeItem(REFRESH_TOKEN_KEY)
    else localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export const adminLogin = async (email: string, password: string) => {
    const res = await httpPost<{ token: string; expires_at: string; refresh_token: string; refresh_expires_at: string }>('/api/v1/admin/auth/login', {
        email,
        password,
    })
    setAdminToken(res.token)
    setAdminRefreshToken(res.refresh_token)
    return res
}

export const adminRefresh = async () => {
    const refreshToken = getAdminRefreshToken()
    const res = await httpPost<{ token: string; expires_at: string; refresh_token: string; refresh_expires_at: string }>(
        '/api/v1/admin/auth/refresh',
        { refresh_token: refreshToken },
    )
    setAdminToken(res.token)
    setAdminRefreshToken(res.refresh_token)
    return res
}

let refreshInFlight: Promise<void> | null = null
const ensureRefreshed = async () => {
    if (refreshInFlight) return refreshInFlight
    refreshInFlight = (async () => {
        await adminRefresh()
    })().finally(() => {
        refreshInFlight = null
    })
    return refreshInFlight
}

const withAccess = async <T>(fn: (token: string) => Promise<T>): Promise<T> => {
    try {
        return await fn(getAdminToken())
    } catch (e) {
        if (e instanceof HttpError && e.status === 401) {
            await ensureRefreshed()
            return await fn(getAdminToken())
        }
        throw e
    }
}

export const adminMe = async () => {
    return withAccess((token) => httpGet<{ id: number; email: string; role: string }>('/api/v1/admin/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    }))
}

export const adminChangePassword = async (oldPassword: string, newPassword: string) => {
    return withAccess((token) => httpPatch<{ ok: boolean }>('/api/v1/admin/me/password', {
        oldPassword,
        newPassword,
    }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    }))
}
