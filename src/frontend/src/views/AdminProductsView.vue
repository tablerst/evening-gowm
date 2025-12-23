<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { HttpError, resolveApiUrl } from '@/api/http'
import { adminDelete, adminGet, adminPatch, adminPost } from '@/admin/api'
import { appEnv } from '@/config/env'
import { compressImageToWebpUnderLimit, uploadAdminImage, type UploadKind } from '@/composables/useAdminImageUpload'

type Product = {
    id: number
    slug?: string
    styleNo: number
    season: string
    category: string
    availability: string
    isNew: boolean
    newRank: number
    coverImage: string
    coverImageKey?: string
    hoverImage: string
    hoverImageKey?: string
    detail?: any
    publishedAt?: string
    deletedAt?: string
}

const router = useRouter()

const loading = ref(false)
const errorMsg = ref('')
const products = ref<Product[]>([])

const filterStatus = ref<'all' | 'draft' | 'published'>('all')

const editingId = ref<number | null>(null)
const editForm = ref({
    slug: '',
    styleNo: 0,
    season: 'ss25',
    category: 'gown',
    availability: 'in_stock',
    isNew: false,
    newRank: 0,
    coverImage: '',
    coverImageKey: '',
    hoverImage: '',
    hoverImageKey: '',
    detailJson: '{"specs":[],"option_groups":[]}',
})

const form = ref({
    styleNo: 0,
    season: 'ss25',
    category: 'gown',
    availability: 'in_stock',
    isNew: false,
    newRank: 0,
    coverImage: '',
    coverImageKey: '',
    hoverImage: '',
    hoverImageKey: '',
    detailJson: '{"specs":[],"option_groups":[]}',
})

type UploadSlotState = {
    uploading: boolean
    error: string
    previewUrl: string
}

const createUpload = ref<Record<UploadKind, UploadSlotState>>({
    cover: { uploading: false, error: '', previewUrl: '' },
    hover: { uploading: false, error: '', previewUrl: '' },
})

const editUpload = ref<Record<UploadKind, UploadSlotState>>({
    cover: { uploading: false, error: '', previewUrl: '' },
    hover: { uploading: false, error: '', previewUrl: '' },
})

const revokePreview = (slot: UploadSlotState) => {
    if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl)
    slot.previewUrl = ''
}

const maxUploadHint = computed(() => `${Math.max(1, Math.round((appEnv.maxImageUploadBytes ?? 1048576) / 1024 / 1024))}MB`)

const onPickImage = async (scope: 'create' | 'edit', kind: UploadKind, e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    // reset input so picking the same file again still triggers change
    input.value = ''
    if (!file) return

    const targetForm = scope === 'create' ? form.value : editForm.value
    const state = scope === 'create' ? createUpload.value : editUpload.value
    const slot = state[kind]

    slot.error = ''
    slot.uploading = true
    try {
        if (!targetForm.styleNo || targetForm.styleNo <= 0) {
            slot.error = '请先填写 StyleNo（用于生成存储路径）'
            return
        }

        const webp = await compressImageToWebpUnderLimit(file, {
            maxBytes: appEnv.maxImageUploadBytes ?? 1048576,
        })

        revokePreview(slot)
        slot.previewUrl = URL.createObjectURL(webp)

        const res = await uploadAdminImage(kind, targetForm.styleNo, webp)

        if (kind === 'cover') {
            targetForm.coverImage = res.url
            targetForm.coverImageKey = res.objectKey
        } else {
            targetForm.hoverImage = res.url
            targetForm.hoverImageKey = res.objectKey
        }
    } catch (err) {
        if (err instanceof HttpError) {
            slot.error = `上传失败（HTTP ${err.status}）`
        } else if (err instanceof Error) {
            slot.error = err.message
        } else {
            slot.error = '上传失败'
        }
    } finally {
        slot.uploading = false
    }
}

const canSubmit = computed(() => form.value.styleNo > 0)

const load = async () => {
    loading.value = true
    errorMsg.value = ''
    try {
        const qs = new URLSearchParams()
        qs.set('limit', '100')
        if (filterStatus.value !== 'all') qs.set('status', filterStatus.value)
        const res = await adminGet<{ items: Product[] }>(`/api/v1/admin/products?${qs.toString()}`)
        products.value = res.items ?? []
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = '加载失败'
    } finally {
        loading.value = false
    }
}

const create = async () => {
    if (!canSubmit.value) return
    loading.value = true
    errorMsg.value = ''
    try {
        const detail = JSON.parse(form.value.detailJson)
        await adminPost('/api/v1/admin/products', {
            styleNo: form.value.styleNo,
            season: form.value.season,
            category: form.value.category,
            availability: form.value.availability,
            isNew: form.value.isNew,
            newRank: form.value.newRank,
            coverImage: form.value.coverImage,
            coverImageKey: form.value.coverImageKey,
            hoverImage: form.value.hoverImage,
            hoverImageKey: form.value.hoverImageKey,
            detail,
        })
        await load()
    } catch {
        errorMsg.value = '创建失败（请检查 JSON 或字段）'
    } finally {
        loading.value = false
    }
}

const startEdit = async (id: number) => {
    loading.value = true
    errorMsg.value = ''
    try {
        const p = await adminGet<Product>(`/api/v1/admin/products/${id}`)
        editingId.value = id
        editForm.value = {
            slug: p.slug ?? '',
            styleNo: p.styleNo,
            season: p.season,
            category: p.category,
            availability: p.availability,
            isNew: !!p.isNew,
            newRank: p.newRank ?? 0,
            coverImage: p.coverImage ?? '',
            coverImageKey: p.coverImageKey ?? '',
            hoverImage: p.hoverImage ?? '',
            hoverImageKey: p.hoverImageKey ?? '',
            detailJson: JSON.stringify(p.detail ?? { specs: [], option_groups: [] }),
        }
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = '加载详情失败'
    } finally {
        loading.value = false
    }
}

const cancelEdit = () => {
    editingId.value = null
}

const saveEdit = async () => {
    if (!editingId.value) return
    loading.value = true
    errorMsg.value = ''
    try {
        let detail: any = undefined
        try {
            detail = JSON.parse(editForm.value.detailJson)
        } catch {
            errorMsg.value = 'Detail JSON 格式错误'
            return
        }

        await adminPatch(`/api/v1/admin/products/${editingId.value}`, {
            slug: editForm.value.slug,
            styleNo: editForm.value.styleNo,
            season: editForm.value.season,
            category: editForm.value.category,
            availability: editForm.value.availability,
            isNew: editForm.value.isNew,
            newRank: editForm.value.newRank,
            coverImage: editForm.value.coverImage,
            coverImageKey: editForm.value.coverImageKey,
            hoverImage: editForm.value.hoverImage,
            hoverImageKey: editForm.value.hoverImageKey,
            detail,
        })
        editingId.value = null
        await load()
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = '保存失败'
    } finally {
        loading.value = false
    }
}

const remove = async (id: number) => {
    if (!confirm(`确认删除产品 #${id}？（软删除，前台将不可见）`)) return
    loading.value = true
    errorMsg.value = ''
    try {
        await adminDelete(`/api/v1/admin/products/${id}`)
        if (editingId.value === id) editingId.value = null
        await load()
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = '删除失败'
    } finally {
        loading.value = false
    }
}

const togglePublish = async (id: number, next: 'publish' | 'unpublish') => {
    loading.value = true
    errorMsg.value = ''
    try {
        await adminPost(`/api/v1/admin/products/${id}/${next}`)
        await load()
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = next === 'publish' ? '发布失败' : '取消发布失败'
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>

<template>
    <main class="min-h-screen bg-white">
        <div class="px-6 py-10 max-w-6xl mx-auto">
            <div class="flex items-center justify-between">
                <h1 class="font-display text-2xl uppercase tracking-wider">Products</h1>
                <router-link :to="{ name: 'admin-home' }" class="font-mono text-xs uppercase tracking-[0.25em]">←
                    Back</router-link>
            </div>

            <p v-if="errorMsg" class="mt-4 font-mono text-xs text-red-600">{{ errorMsg }}</p>

            <section class="mt-8 border border-border p-6">
                <h2 class="font-mono text-xs uppercase tracking-[0.25em] text-black/60">Create</h2>
                <div class="mt-4 grid md:grid-cols-2 gap-3">
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">StyleNo</div>
                        <input v-model.number="form.styleNo" type="number"
                            class="mt-1 w-full h-10 px-3 border border-border" />
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">Season</div>
                        <input v-model.trim="form.season" class="mt-1 w-full h-10 px-3 border border-border" />
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">Category</div>
                        <input v-model.trim="form.category" class="mt-1 w-full h-10 px-3 border border-border" />
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">Availability</div>
                        <input v-model.trim="form.availability" class="mt-1 w-full h-10 px-3 border border-border" />
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">Cover Image URL</div>
                        <input v-model.trim="form.coverImage" @input="form.coverImageKey = ''"
                            class="mt-1 w-full h-10 px-3 border border-border" />

                        <div class="mt-2 flex items-center gap-3">
                            <input type="file" accept="image/*" :disabled="loading || createUpload.cover.uploading"
                                @change="(e) => onPickImage('create', 'cover', e)" class="block w-full text-xs" />
                            <span v-if="createUpload.cover.uploading"
                                class="font-mono text-xs text-black/60">Uploading…</span>
                        </div>
                        <p class="mt-1 font-mono text-xs text-black/40">自动压缩为 WebP（≤ {{ maxUploadHint }}）并上传到 MinIO</p>
                        <p v-if="createUpload.cover.error" class="mt-1 font-mono text-xs text-red-600">{{
                            createUpload.cover.error }}</p>
                        <div v-if="createUpload.cover.previewUrl || form.coverImage" class="mt-2">
                            <img :src="createUpload.cover.previewUrl || resolveApiUrl(form.coverImage)"
                                class="h-14 w-14 object-cover border border-border" />
                        </div>
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">Hover Image URL</div>
                        <input v-model.trim="form.hoverImage" @input="form.hoverImageKey = ''"
                            class="mt-1 w-full h-10 px-3 border border-border" />

                        <div class="mt-2 flex items-center gap-3">
                            <input type="file" accept="image/*" :disabled="loading || createUpload.hover.uploading"
                                @change="(e) => onPickImage('create', 'hover', e)" class="block w-full text-xs" />
                            <span v-if="createUpload.hover.uploading"
                                class="font-mono text-xs text-black/60">Uploading…</span>
                        </div>
                        <p class="mt-1 font-mono text-xs text-black/40">自动压缩为 WebP（≤ {{ maxUploadHint }}）并上传到 MinIO</p>
                        <p v-if="createUpload.hover.error" class="mt-1 font-mono text-xs text-red-600">{{
                            createUpload.hover.error }}</p>
                        <div v-if="createUpload.hover.previewUrl || form.hoverImage" class="mt-2">
                            <img :src="createUpload.hover.previewUrl || resolveApiUrl(form.hoverImage)"
                                class="h-14 w-14 object-cover border border-border" />
                        </div>
                    </label>
                    <label class="flex items-center gap-2 font-mono text-xs">
                        <input v-model="form.isNew" type="checkbox" />
                        New
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">New Rank</div>
                        <input v-model.number="form.newRank" type="number"
                            class="mt-1 w-full h-10 px-3 border border-border" />
                    </label>
                </div>
                <label class="block mt-3">
                    <div class="font-mono text-xs text-black/60">Detail JSON (options/specs)</div>
                    <textarea v-model="form.detailJson" rows="6"
                        class="mt-1 w-full px-3 py-2 border border-border font-mono text-xs"></textarea>
                </label>
                <button :disabled="loading || !canSubmit" @click="create"
                    class="mt-4 h-10 px-4 bg-brand text-white font-mono text-xs uppercase tracking-[0.25em] disabled:opacity-60">
                    Create
                </button>
            </section>

            <section v-if="editingId" class="mt-8 border border-border p-6">
                <div class="flex items-center justify-between gap-4">
                    <h2 class="font-mono text-xs uppercase tracking-[0.25em] text-black/60">Edit #{{ editingId }}</h2>
                    <button :disabled="loading" @click="cancelEdit"
                        class="h-9 px-3 border border-border font-mono text-xs uppercase tracking-[0.25em] disabled:opacity-60">Cancel</button>
                </div>
                <div class="mt-4 grid md:grid-cols-2 gap-3">
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">Slug</div>
                        <input v-model.trim="editForm.slug" class="mt-1 w-full h-10 px-3 border border-border" />
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">StyleNo</div>
                        <input v-model.number="editForm.styleNo" type="number"
                            class="mt-1 w-full h-10 px-3 border border-border" />
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">Season</div>
                        <input v-model.trim="editForm.season" class="mt-1 w-full h-10 px-3 border border-border" />
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">Category</div>
                        <input v-model.trim="editForm.category" class="mt-1 w-full h-10 px-3 border border-border" />
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">Availability</div>
                        <input v-model.trim="editForm.availability"
                            class="mt-1 w-full h-10 px-3 border border-border" />
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">Cover Image URL</div>
                        <input v-model.trim="editForm.coverImage" @input="editForm.coverImageKey = ''"
                            class="mt-1 w-full h-10 px-3 border border-border" />

                        <div class="mt-2 flex items-center gap-3">
                            <input type="file" accept="image/*" :disabled="loading || editUpload.cover.uploading"
                                @change="(e) => onPickImage('edit', 'cover', e)" class="block w-full text-xs" />
                            <span v-if="editUpload.cover.uploading"
                                class="font-mono text-xs text-black/60">Uploading…</span>
                        </div>
                        <p class="mt-1 font-mono text-xs text-black/40">自动压缩为 WebP（≤ {{ maxUploadHint }}）并上传到 MinIO</p>
                        <p v-if="editUpload.cover.error" class="mt-1 font-mono text-xs text-red-600">{{
                            editUpload.cover.error }}</p>
                        <div v-if="editUpload.cover.previewUrl || editForm.coverImage" class="mt-2">
                            <img :src="editUpload.cover.previewUrl || resolveApiUrl(editForm.coverImage)"
                                class="h-14 w-14 object-cover border border-border" />
                        </div>
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">Hover Image URL</div>
                        <input v-model.trim="editForm.hoverImage" @input="editForm.hoverImageKey = ''"
                            class="mt-1 w-full h-10 px-3 border border-border" />

                        <div class="mt-2 flex items-center gap-3">
                            <input type="file" accept="image/*" :disabled="loading || editUpload.hover.uploading"
                                @change="(e) => onPickImage('edit', 'hover', e)" class="block w-full text-xs" />
                            <span v-if="editUpload.hover.uploading"
                                class="font-mono text-xs text-black/60">Uploading…</span>
                        </div>
                        <p class="mt-1 font-mono text-xs text-black/40">自动压缩为 WebP（≤ {{ maxUploadHint }}）并上传到 MinIO</p>
                        <p v-if="editUpload.hover.error" class="mt-1 font-mono text-xs text-red-600">{{
                            editUpload.hover.error }}</p>
                        <div v-if="editUpload.hover.previewUrl || editForm.hoverImage" class="mt-2">
                            <img :src="editUpload.hover.previewUrl || resolveApiUrl(editForm.hoverImage)"
                                class="h-14 w-14 object-cover border border-border" />
                        </div>
                    </label>
                    <label class="flex items-center gap-2 font-mono text-xs">
                        <input v-model="editForm.isNew" type="checkbox" />
                        New
                    </label>
                    <label class="block">
                        <div class="font-mono text-xs text-black/60">New Rank</div>
                        <input v-model.number="editForm.newRank" type="number"
                            class="mt-1 w-full h-10 px-3 border border-border" />
                    </label>
                </div>
                <label class="block mt-3">
                    <div class="font-mono text-xs text-black/60">Detail JSON (options/specs)</div>
                    <textarea v-model="editForm.detailJson" rows="6"
                        class="mt-1 w-full px-3 py-2 border border-border font-mono text-xs"></textarea>
                </label>
                <button :disabled="loading" @click="saveEdit"
                    class="mt-4 h-10 px-4 bg-brand text-white font-mono text-xs uppercase tracking-[0.25em] disabled:opacity-60">
                    Save
                </button>
            </section>

            <section class="mt-8">
                <div class="flex items-center justify-between gap-4">
                    <h2 class="font-mono text-xs uppercase tracking-[0.25em] text-black/60">List</h2>
                    <div class="flex items-center gap-3">
                        <select v-model="filterStatus" class="h-9 px-2 border border-border font-mono text-xs">
                            <option value="all">all</option>
                            <option value="draft">draft</option>
                            <option value="published">published</option>
                        </select>
                        <button @click="load"
                            class="h-9 px-3 border border-border font-mono text-xs uppercase tracking-[0.25em]">Refresh</button>
                    </div>
                </div>

                <div class="mt-4 overflow-x-auto border border-border">
                    <table class="min-w-full text-left font-mono text-xs">
                        <thead class="bg-border/30">
                            <tr>
                                <th class="p-3">ID</th>
                                <th class="p-3">StyleNo</th>
                                <th class="p-3">Season</th>
                                <th class="p-3">Category</th>
                                <th class="p-3">New</th>
                                <th class="p-3">Published</th>
                                <th class="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="p in products" :key="p.id" class="border-t border-border">
                                <td class="p-3">{{ p.id }}</td>
                                <td class="p-3">{{ p.styleNo }}</td>
                                <td class="p-3">{{ p.season }}</td>
                                <td class="p-3">{{ p.category }}</td>
                                <td class="p-3">{{ p.isNew ? 'YES' : 'NO' }}</td>
                                <td class="p-3">{{ p.publishedAt ? 'YES' : 'NO' }}</td>
                                <td class="p-3">
                                    <button :disabled="loading" @click="startEdit(p.id)"
                                        class="h-8 px-3 border border-border bg-white hover:border-black transition-none disabled:opacity-60">
                                        Edit
                                    </button>
                                    <button v-if="!p.publishedAt" :disabled="loading"
                                        @click="togglePublish(p.id, 'publish')"
                                        class="h-8 px-3 border border-black bg-white hover:bg-brand hover:text-white transition-none disabled:opacity-60">
                                        Publish
                                    </button>
                                    <button v-else :disabled="loading" @click="togglePublish(p.id, 'unpublish')"
                                        class="h-8 px-3 border border-border bg-white hover:border-black transition-none disabled:opacity-60">
                                        Unpublish
                                    </button>
                                    <button :disabled="loading" @click="remove(p.id)"
                                        class="h-8 px-3 border border-red-300 bg-white text-red-700 hover:border-red-500 transition-none disabled:opacity-60">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </main>
</template>
