<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { NButton, NCard, NForm, NFormItem, NInput, NInputNumber, NModal, NSelect, NSpace } from 'naive-ui'

import { HttpError } from '@/api/http'
import { adminDelete, adminGet, adminPatch, adminPost } from '@/admin/api'

type UpdatePost = {
    id: number
    type: string
    status: string
    tag: string
    title: string
    body: string
    refCode: string
    summary?: string
    pinnedRank?: number
    publishedAt?: string
    deletedAt?: string
}

const router = useRouter()
const { t, locale } = useI18n()
const loading = ref(false)
const errorMsg = ref('')
const items = ref<UpdatePost[]>([])

const filterType = ref<'all' | 'company' | 'industry'>('all')
const filterStatus = ref<'all' | 'draft' | 'published' | 'archived'>('all')

const showCreateModal = ref(false)
const showEditModal = ref(false)

const typeOptions = computed(() => {
    void locale.value
    return [
        { label: t('admin.updates.filters.type.all'), value: 'all' },
        { label: t('admin.updates.filters.type.company'), value: 'company' },
        { label: t('admin.updates.filters.type.industry'), value: 'industry' },
    ]
})

const statusFilterOptions = computed(() => {
    void locale.value
    return [
        { label: t('admin.updates.filters.status.all'), value: 'all' },
        { label: t('admin.updates.filters.status.draft'), value: 'draft' },
        { label: t('admin.updates.filters.status.published'), value: 'published' },
        { label: t('admin.updates.filters.status.archived'), value: 'archived' },
    ]
})

const createStatusOptions = computed(() => {
    void locale.value
    return [
        { label: t('admin.updates.filters.status.draft'), value: 'draft' },
        { label: t('admin.updates.filters.status.published'), value: 'published' },
    ]
})

const editTypeOptions = computed(() => {
    void locale.value
    return [
        { label: t('admin.updates.filters.type.company'), value: 'company' },
        { label: t('admin.updates.filters.type.industry'), value: 'industry' },
    ]
})

const editStatusOptions = computed(() => {
    void locale.value
    return [
        { label: t('admin.updates.filters.status.draft'), value: 'draft' },
        { label: t('admin.updates.filters.status.published'), value: 'published' },
        { label: t('admin.updates.filters.status.archived'), value: 'archived' },
    ]
})

const renderStatus = (status: string) => {
    if (status === 'draft' || status === 'published' || status === 'archived') {
        return t(`admin.updates.filters.status.${status}`)
    }
    return status
}

const editingId = ref<number | null>(null)
const editForm = ref({
    type: 'company' as 'company' | 'industry',
    status: 'draft' as 'draft' | 'published' | 'archived',
    tag: '新品',
    title: '',
    summary: '',
    body: '',
    ref: '',
    pinnedRank: 0,
})

const form = ref({
    tag: '新品',
    title: '',
    body: '',
    ref: '',
    status: 'published' as 'draft' | 'published',
})

const load = async () => {
    loading.value = true
    errorMsg.value = ''
    try {
        const qs = new URLSearchParams()
        qs.set('limit', '50')
        if (filterType.value !== 'all') qs.set('type', filterType.value)
        if (filterStatus.value !== 'all') qs.set('status', filterStatus.value)
        const res = await adminGet<{ items: UpdatePost[] }>(`/api/v1/admin/updates?${qs.toString()}`)
        items.value = res.items ?? []
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = t('admin.updates.errors.load')
    } finally {
        loading.value = false
    }
}

const create = async () => {
    if (!form.value.title.trim()) return
    loading.value = true
    errorMsg.value = ''
    try {
        await adminPost('/api/v1/admin/updates', {
            type: 'company',
            status: form.value.status,
            tag: form.value.tag,
            title: form.value.title,
            body: form.value.body,
            ref: form.value.ref,
        })
        form.value.title = ''
        form.value.body = ''
        form.value.ref = ''
        await load()

        showCreateModal.value = false
    } catch {
        errorMsg.value = t('admin.updates.errors.create')
    } finally {
        loading.value = false
    }
}

const startEdit = async (id: number) => {
    loading.value = true
    errorMsg.value = ''
    try {
        const u = await adminGet<UpdatePost>(`/api/v1/admin/updates/${id}`)
        editingId.value = id
        editForm.value = {
            type: (u.type === 'industry' ? 'industry' : 'company') as any,
            status: (u.status === 'archived' ? 'archived' : u.status === 'published' ? 'published' : 'draft') as any,
            tag: u.tag ?? '',
            title: u.title ?? '',
            summary: u.summary ?? '',
            body: u.body ?? '',
            ref: u.refCode ?? '',
            pinnedRank: (u.pinnedRank ?? 0) as number,
        }

        showEditModal.value = true
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = t('admin.updates.errors.loadDetail')
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
    if (!editForm.value.title.trim()) {
        errorMsg.value = t('admin.updates.errors.titleRequired')
        return
    }
    loading.value = true
    errorMsg.value = ''
    try {
        await adminPatch(`/api/v1/admin/updates/${editingId.value}`, {
            type: editForm.value.type,
            status: editForm.value.status,
            tag: editForm.value.tag,
            title: editForm.value.title,
            summary: editForm.value.summary,
            body: editForm.value.body,
            ref: editForm.value.ref,
            pinnedRank: editForm.value.pinnedRank,
        })
        editingId.value = null
        showEditModal.value = false
        await load()
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = t('admin.updates.errors.save')
    } finally {
        loading.value = false
    }
}

const publish = async (id: number) => {
    loading.value = true
    errorMsg.value = ''
    try {
        await adminPost(`/api/v1/admin/updates/${id}/publish`)
        await load()
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = t('admin.updates.errors.publish')
    } finally {
        loading.value = false
    }
}

const unpublish = async (id: number) => {
    loading.value = true
    errorMsg.value = ''
    try {
        await adminPost(`/api/v1/admin/updates/${id}/unpublish`)
        await load()
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = t('admin.updates.errors.unpublish')
    } finally {
        loading.value = false
    }
}

const remove = async (id: number) => {
    if (!confirm(t('admin.updates.confirmDelete', { id }))) return
    loading.value = true
    errorMsg.value = ''
    try {
        await adminDelete(`/api/v1/admin/updates/${id}`)
        if (editingId.value === id) editingId.value = null
        await load()
    } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
            await router.replace({ name: 'admin-login' })
            return
        }
        errorMsg.value = t('admin.updates.errors.delete')
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>

<template>
    <div class="max-w-5xl mx-auto">
        <NCard size="large">
            <NSpace justify="space-between" align="center" :wrap="true">
                <NSpace align="center" :size="12" :wrap="true">
                    <div class="font-mono text-xs uppercase tracking-[0.25em] text-black/50">{{
                        t('admin.updates.filters.label') }}</div>
                    <NSelect v-model:value="filterType" :options="typeOptions as any" style="width: 160px"
                        size="small" />
                    <NSelect v-model:value="filterStatus" :options="statusFilterOptions as any" style="width: 160px"
                        size="small" />
                    <NButton size="small" secondary :loading="loading" @click="load">{{ t('admin.actions.refresh') }}
                    </NButton>
                </NSpace>
                <NButton size="small" type="primary" @click="showCreateModal = true">{{ t('admin.updates.new') }}
                </NButton>
            </NSpace>

            <p v-if="errorMsg" class="mt-3 font-mono text-xs text-red-600">{{ errorMsg }}</p>

            <div class="mt-4 space-y-3">
                <NCard v-for="u in items" :key="u.id" size="small">
                    <div class="flex justify-between gap-4">
                        <div class="font-mono text-xs text-black/60">#{{ u.id }} · {{ u.tag }} · {{
                            renderStatus(u.status) }}</div>
                        <div class="font-mono text-xs text-black/60">{{ u.refCode }}</div>
                    </div>
                    <div class="mt-2 font-sans font-semibold uppercase tracking-[0.22em] text-sm">{{ u.title }}</div>
                    <p class="mt-2 text-sm text-black/70 whitespace-pre-wrap">{{ u.body }}</p>
                    <div class="mt-3">
                        <NSpace :size="8" :wrap="true">
                            <NButton size="tiny" secondary :disabled="loading" @click="startEdit(u.id)">{{
                                t('admin.actions.edit') }}</NButton>
                            <NButton v-if="u.status !== 'published'" size="tiny" :disabled="loading"
                                @click="publish(u.id)">{{ t('admin.actions.publish') }}</NButton>
                            <NButton v-else size="tiny" secondary :disabled="loading" @click="unpublish(u.id)">{{
                                t('admin.actions.unpublish') }}</NButton>
                            <NButton size="tiny" type="error" secondary :disabled="loading" @click="remove(u.id)">{{
                                t('admin.actions.delete') }}</NButton>
                        </NSpace>
                    </div>
                </NCard>
            </div>
        </NCard>

        <NModal v-model:show="showCreateModal" preset="card" style="width: min(860px, calc(100vw - 32px))">
            <template #header>
                <div class="font-display text-lg uppercase tracking-wider">{{ t('admin.updates.modal.createTitle') }}
                </div>
            </template>
            <NForm :show-feedback="false" label-placement="top">
                <div class="grid md:grid-cols-2 gap-3">
                    <NFormItem :label="t('admin.updates.fields.tag')">
                        <NInput v-model:value="form.tag" />
                    </NFormItem>
                    <NFormItem :label="t('admin.updates.fields.ref')">
                        <NInput v-model:value="form.ref" />
                    </NFormItem>
                    <NFormItem :label="t('admin.updates.fields.status')">
                        <NSelect v-model:value="form.status" :options="createStatusOptions as any" />
                    </NFormItem>
                </div>
                <NFormItem :label="t('admin.updates.fields.title')">
                    <NInput v-model:value="form.title" />
                </NFormItem>
                <NFormItem :label="t('admin.updates.fields.body')">
                    <NInput v-model:value="form.body" type="textarea" :autosize="{ minRows: 4, maxRows: 12 }" />
                </NFormItem>
                <NSpace justify="end" :size="12">
                    <NButton secondary :disabled="loading" @click="showCreateModal = false">{{ t('admin.actions.cancel')
                        }}
                    </NButton>
                    <NButton type="primary" :loading="loading" :disabled="!form.title.trim()" @click="create">{{
                        t('admin.actions.create') }}</NButton>
                </NSpace>
            </NForm>
        </NModal>

        <NModal v-model:show="showEditModal" preset="card" style="width: min(860px, calc(100vw - 32px))">
            <template #header>
                <div class="font-display text-lg uppercase tracking-wider">{{ t('admin.updates.modal.editTitle', {
                    id:
                    editingId }) }}</div>
            </template>
            <NForm :show-feedback="false" label-placement="top">
                <div class="grid md:grid-cols-2 gap-3">
                    <NFormItem :label="t('admin.updates.fields.type')">
                        <NSelect v-model:value="editForm.type" :options="editTypeOptions as any" />
                    </NFormItem>
                    <NFormItem :label="t('admin.updates.fields.status')">
                        <NSelect v-model:value="editForm.status" :options="editStatusOptions as any" />
                    </NFormItem>
                    <NFormItem :label="t('admin.updates.fields.pinnedRank')">
                        <NInputNumber v-model:value="editForm.pinnedRank" :min="0" />
                    </NFormItem>
                    <NFormItem :label="t('admin.updates.fields.tag')">
                        <NInput v-model:value="editForm.tag" />
                    </NFormItem>
                </div>

                <div class="grid md:grid-cols-2 gap-3">
                    <NFormItem :label="t('admin.updates.fields.ref')">
                        <NInput v-model:value="editForm.ref" />
                    </NFormItem>
                    <NFormItem :label="t('admin.updates.fields.title')">
                        <NInput v-model:value="editForm.title" />
                    </NFormItem>
                </div>

                <NFormItem :label="t('admin.updates.fields.summary')">
                    <NInput v-model:value="editForm.summary" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" />
                </NFormItem>
                <NFormItem :label="t('admin.updates.fields.body')">
                    <NInput v-model:value="editForm.body" type="textarea" :autosize="{ minRows: 4, maxRows: 12 }" />
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
