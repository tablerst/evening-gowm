<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { NButton, NCard, NForm, NFormItem, NInput, NInputNumber, NModal, NSpace, NSwitch } from 'naive-ui'

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
const { t } = useI18n()

const loading = ref(false)
const errorMsg = ref('')
const products = ref<Product[]>([])

const filterStatus = ref<'all' | 'draft' | 'published'>('all')

const showCreateModal = ref(false)
const showEditModal = ref(false)

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
            slot.error = t('admin.products.upload.needStyleNo')
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
            slot.error = t('admin.products.upload.failHttp', { status: err.status })
        } else if (err instanceof Error) {
            slot.error = err.message
        } else {
            slot.error = t('admin.products.upload.fail')
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
        errorMsg.value = t('admin.products.errors.load')
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

        showCreateModal.value = false
    } catch {
        errorMsg.value = t('admin.products.errors.create')
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

        showEditModal.value = true
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = t('admin.products.errors.loadDetail')
    } finally {
        loading.value = false
    }
}

const cancelEdit = () => {
    editingId.value = null
    showEditModal.value = false
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
            errorMsg.value = t('admin.products.errors.detailJson')
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
        showEditModal.value = false
        await load()
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = t('admin.products.errors.save')
    } finally {
        loading.value = false
    }
}

const remove = async (id: number) => {
    if (!confirm(t('admin.products.confirmDelete', { id }))) return
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
        errorMsg.value = t('admin.products.errors.delete')
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
        errorMsg.value = next === 'publish' ? t('admin.products.errors.publish') : t('admin.products.errors.unpublish')
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>

<template>
    <div class="max-w-6xl mx-auto">
        <NCard size="large">
            <NSpace justify="space-between" align="center" :wrap="true">
                <NSpace align="center" :size="12" :wrap="true">
                    <div class="font-mono text-xs uppercase tracking-[0.25em] text-black/50">{{
                        t('admin.products.filters.status') }}</div>
                    <select v-model="filterStatus" class="h-9 px-2 border border-border font-mono text-xs">
                        <option value="all">{{ t('admin.products.filters.all') }}</option>
                        <option value="draft">{{ t('admin.products.filters.draft') }}</option>
                        <option value="published">{{ t('admin.products.filters.published') }}</option>
                    </select>
                    <NButton size="small" :loading="loading" secondary @click="load">{{ t('admin.actions.refresh') }}
                    </NButton>
                </NSpace>
                <NButton size="small" type="primary" @click="showCreateModal = true">{{ t('admin.products.new') }}
                </NButton>
            </NSpace>

            <p v-if="errorMsg" class="mt-3 font-mono text-xs text-red-600">{{ errorMsg }}</p>

            <div class="mt-4 overflow-x-auto border border-border">
                <table class="min-w-full text-left font-mono text-xs">
                    <thead class="bg-border/30">
                        <tr>
                            <th class="p-3">{{ t('admin.products.table.id') }}</th>
                            <th class="p-3">{{ t('admin.products.table.styleNo') }}</th>
                            <th class="p-3">{{ t('admin.products.table.season') }}</th>
                            <th class="p-3">{{ t('admin.products.table.category') }}</th>
                            <th class="p-3">{{ t('admin.products.table.isNew') }}</th>
                            <th class="p-3">{{ t('admin.products.table.published') }}</th>
                            <th class="p-3">{{ t('admin.products.table.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="p in products" :key="p.id" class="border-t border-border">
                            <td class="p-3">{{ p.id }}</td>
                            <td class="p-3">{{ p.styleNo }}</td>
                            <td class="p-3">{{ p.season }}</td>
                            <td class="p-3">{{ p.category }}</td>
                            <td class="p-3">{{ p.isNew ? t('admin.common.yes') : t('admin.common.no') }}</td>
                            <td class="p-3">{{ p.publishedAt ? t('admin.common.yes') : t('admin.common.no') }}</td>
                            <td class="p-3">
                                <NSpace :size="8" :wrap="true">
                                    <NButton size="tiny" secondary :disabled="loading" @click="startEdit(p.id)">{{
                                        t('admin.actions.edit') }}</NButton>
                                    <NButton v-if="!p.publishedAt" size="tiny" :disabled="loading"
                                        @click="togglePublish(p.id, 'publish')">{{ t('admin.actions.publish') }}
                                    </NButton>
                                    <NButton v-else size="tiny" secondary :disabled="loading"
                                        @click="togglePublish(p.id, 'unpublish')">{{ t('admin.actions.unpublish') }}
                                    </NButton>
                                    <NButton size="tiny" type="error" secondary :disabled="loading"
                                        @click="remove(p.id)">{{ t('admin.actions.delete') }}</NButton>
                                </NSpace>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </NCard>

        <NModal v-model:show="showCreateModal" preset="card" style="width: min(860px, calc(100vw - 32px))">
            <template #header>
                <div class="font-display text-lg uppercase tracking-wider">{{ t('admin.products.modal.createTitle') }}
                </div>
            </template>
            <NForm :show-feedback="false" label-placement="top">
                <div class="grid md:grid-cols-2 gap-3">
                    <NFormItem :label="t('admin.products.fields.styleNo')">
                        <NInputNumber v-model:value="form.styleNo" :min="0" />
                    </NFormItem>
                    <NFormItem :label="t('admin.products.fields.season')">
                        <NInput v-model:value="form.season" />
                    </NFormItem>
                    <NFormItem :label="t('admin.products.fields.category')">
                        <NInput v-model:value="form.category" />
                    </NFormItem>
                    <NFormItem :label="t('admin.products.fields.availability')">
                        <NInput v-model:value="form.availability" />
                    </NFormItem>
                    <NFormItem :label="t('admin.products.fields.isNew')">
                        <NSwitch v-model:value="form.isNew" />
                    </NFormItem>
                    <NFormItem :label="t('admin.products.fields.newRank')">
                        <NInputNumber v-model:value="form.newRank" :min="0" />
                    </NFormItem>
                </div>

                <div class="grid md:grid-cols-2 gap-3">
                    <div>
                        <div class="font-mono text-xs uppercase tracking-[0.25em] text-black/50">{{
                            t('admin.products.fields.coverImage') }}</div>
                        <div class="mt-2">
                            <NInput v-model:value="form.coverImage" @input="form.coverImageKey = ''"
                                :placeholder="t('admin.products.upload.url')" />
                        </div>
                        <div class="mt-2 flex items-center gap-3">
                            <input type="file" accept="image/*" :disabled="loading || createUpload.cover.uploading"
                                @change="(e) => onPickImage('create', 'cover', e)" class="block w-full text-xs" />
                            <span v-if="createUpload.cover.uploading" class="font-mono text-xs text-black/60">{{
                                t('admin.products.upload.uploading') }}</span>
                        </div>
                        <p class="mt-1 font-mono text-xs text-black/40">{{ t('admin.products.upload.hint', {
                            size:
                            maxUploadHint })
                            }}</p>
                        <p v-if="createUpload.cover.error" class="mt-1 font-mono text-xs text-red-600">{{
                            createUpload.cover.error
                        }}</p>
                        <div v-if="createUpload.cover.previewUrl || form.coverImage" class="mt-2">
                            <img :src="createUpload.cover.previewUrl || resolveApiUrl(form.coverImage)"
                                class="h-14 w-14 object-cover border border-border" />
                        </div>
                    </div>
                    <div>
                        <div class="font-mono text-xs uppercase tracking-[0.25em] text-black/50">{{
                            t('admin.products.fields.hoverImage') }}</div>
                        <div class="mt-2">
                            <NInput v-model:value="form.hoverImage" @input="form.hoverImageKey = ''"
                                :placeholder="t('admin.products.upload.url')" />
                        </div>
                        <div class="mt-2 flex items-center gap-3">
                            <input type="file" accept="image/*" :disabled="loading || createUpload.hover.uploading"
                                @change="(e) => onPickImage('create', 'hover', e)" class="block w-full text-xs" />
                            <span v-if="createUpload.hover.uploading" class="font-mono text-xs text-black/60">{{
                                t('admin.products.upload.uploading') }}</span>
                        </div>
                        <p class="mt-1 font-mono text-xs text-black/40">{{ t('admin.products.upload.hint', {
                            size:
                            maxUploadHint })
                            }}</p>
                        <p v-if="createUpload.hover.error" class="mt-1 font-mono text-xs text-red-600">{{
                            createUpload.hover.error
                        }}</p>
                        <div v-if="createUpload.hover.previewUrl || form.hoverImage" class="mt-2">
                            <img :src="createUpload.hover.previewUrl || resolveApiUrl(form.hoverImage)"
                                class="h-14 w-14 object-cover border border-border" />
                        </div>
                    </div>
                </div>

                <NFormItem :label="t('admin.products.fields.detailJson')" class="mt-3">
                    <NInput v-model:value="form.detailJson" type="textarea" :autosize="{ minRows: 6, maxRows: 14 }"
                        class="font-mono text-xs" />
                </NFormItem>

                <NSpace justify="end" :size="12">
                    <NButton secondary :disabled="loading" @click="showCreateModal = false">{{ t('admin.actions.cancel')
                        }}
                    </NButton>
                    <NButton type="primary" :loading="loading" :disabled="!canSubmit" @click="create">{{
                        t('admin.actions.create')
                        }}</NButton>
                </NSpace>
            </NForm>
        </NModal>

        <NModal v-model:show="showEditModal" preset="card" style="width: min(860px, calc(100vw - 32px))">
            <template #header>
                <div class="font-display text-lg uppercase tracking-wider">{{ t('admin.products.modal.editTitle', {
                    id:
                    editingId }) }}</div>
            </template>
            <NForm :show-feedback="false" label-placement="top">
                <div class="grid md:grid-cols-2 gap-3">
                    <NFormItem :label="t('admin.products.fields.slug')">
                        <NInput v-model:value="editForm.slug" />
                    </NFormItem>
                    <NFormItem :label="t('admin.products.fields.styleNo')">
                        <NInputNumber v-model:value="editForm.styleNo" :min="0" />
                    </NFormItem>
                    <NFormItem :label="t('admin.products.fields.season')">
                        <NInput v-model:value="editForm.season" />
                    </NFormItem>
                    <NFormItem :label="t('admin.products.fields.category')">
                        <NInput v-model:value="editForm.category" />
                    </NFormItem>
                    <NFormItem :label="t('admin.products.fields.availability')">
                        <NInput v-model:value="editForm.availability" />
                    </NFormItem>
                    <NFormItem :label="t('admin.products.fields.isNew')">
                        <NSwitch v-model:value="editForm.isNew" />
                    </NFormItem>
                    <NFormItem :label="t('admin.products.fields.newRank')">
                        <NInputNumber v-model:value="editForm.newRank" :min="0" />
                    </NFormItem>
                </div>

                <div class="grid md:grid-cols-2 gap-3">
                    <div>
                        <div class="font-mono text-xs uppercase tracking-[0.25em] text-black/50">{{
                            t('admin.products.fields.coverImage') }}</div>
                        <div class="mt-2">
                            <NInput v-model:value="editForm.coverImage" @input="editForm.coverImageKey = ''"
                                :placeholder="t('admin.products.upload.url')" />
                        </div>
                        <div class="mt-2 flex items-center gap-3">
                            <input type="file" accept="image/*" :disabled="loading || editUpload.cover.uploading"
                                @change="(e) => onPickImage('edit', 'cover', e)" class="block w-full text-xs" />
                            <span v-if="editUpload.cover.uploading" class="font-mono text-xs text-black/60">{{
                                t('admin.products.upload.uploading') }}</span>
                        </div>
                        <p class="mt-1 font-mono text-xs text-black/40">{{ t('admin.products.upload.hint', {
                            size:
                            maxUploadHint
                            }) }}</p>
                        <p v-if="editUpload.cover.error" class="mt-1 font-mono text-xs text-red-600">{{
                            editUpload.cover.error
                        }}</p>
                        <div v-if="editUpload.cover.previewUrl || editForm.coverImage" class="mt-2">
                            <img :src="editUpload.cover.previewUrl || resolveApiUrl(editForm.coverImage)"
                                class="h-14 w-14 object-cover border border-border" />
                        </div>
                    </div>
                    <div>
                        <div class="font-mono text-xs uppercase tracking-[0.25em] text-black/50">{{
                            t('admin.products.fields.hoverImage') }}</div>
                        <div class="mt-2">
                            <NInput v-model:value="editForm.hoverImage" @input="editForm.hoverImageKey = ''"
                                :placeholder="t('admin.products.upload.url')" />
                        </div>
                        <div class="mt-2 flex items-center gap-3">
                            <input type="file" accept="image/*" :disabled="loading || editUpload.hover.uploading"
                                @change="(e) => onPickImage('edit', 'hover', e)" class="block w-full text-xs" />
                            <span v-if="editUpload.hover.uploading" class="font-mono text-xs text-black/60">{{
                                t('admin.products.upload.uploading') }}</span>
                        </div>
                        <p class="mt-1 font-mono text-xs text-black/40">{{ t('admin.products.upload.hint', {
                            size:
                            maxUploadHint
                            }) }}</p>
                        <p v-if="editUpload.hover.error" class="mt-1 font-mono text-xs text-red-600">{{
                            editUpload.hover.error
                        }}</p>
                        <div v-if="editUpload.hover.previewUrl || editForm.hoverImage" class="mt-2">
                            <img :src="editUpload.hover.previewUrl || resolveApiUrl(editForm.hoverImage)"
                                class="h-14 w-14 object-cover border border-border" />
                        </div>
                    </div>
                </div>

                <NFormItem :label="t('admin.products.fields.detailJson')" class="mt-3">
                    <NInput v-model:value="editForm.detailJson" type="textarea" :autosize="{ minRows: 6, maxRows: 14 }"
                        class="font-mono text-xs" />
                </NFormItem>

                <NSpace justify="end" :size="12">
                    <NButton secondary :disabled="loading" @click="cancelEdit">{{ t('admin.actions.cancel') }}</NButton>
                    <NButton type="primary" :loading="loading" :disabled="!editingId" @click="saveEdit">{{
                        t('admin.actions.save') }}</NButton>
                </NSpace>
            </NForm>
        </NModal>
    </div>
</template>
