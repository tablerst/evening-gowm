<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { HttpError, httpPost } from '@/api/http'
import wechatQrPlaceholder from '@/assets/wechat-qr-placeholder.svg'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()

const titleId = useId()
const descriptionId = useId()
const modalRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const isSubmitting = ref(false)
const hasSubmitted = ref(false)
const errorMsg = ref('')

const createEmptyForm = () => ({
  name: '',
  phone: '',
  message: '',
})

const form = ref(createEmptyForm())

let previousActiveElement: HTMLElement | null = null
let previousBodyOverflow: string | null = null
let previousHtmlOverflow: string | null = null

const readUtm = () => {
  if (typeof window === 'undefined') return {}

  const params = new URL(window.location.href).searchParams
  return {
    utm_source: params.get('utm_source') ?? '',
    utm_medium: params.get('utm_medium') ?? '',
    utm_campaign: params.get('utm_campaign') ?? '',
    utm_content: params.get('utm_content') ?? '',
    utm_term: params.get('utm_term') ?? '',
  }
}

const resetFormState = () => {
  isSubmitting.value = false
  hasSubmitted.value = false
  errorMsg.value = ''
  form.value = createEmptyForm()
}

const close = () => {
  emit('update:modelValue', false)
}

const lockPageScroll = () => {
  if (typeof document === 'undefined' || previousBodyOverflow !== null) return

  previousBodyOverflow = document.body.style.overflow
  previousHtmlOverflow = document.documentElement.style.overflow
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
}

const unlockPageScroll = () => {
  if (typeof document === 'undefined' || previousBodyOverflow === null) return

  document.body.style.overflow = previousBodyOverflow
  document.documentElement.style.overflow = previousHtmlOverflow ?? ''
  previousBodyOverflow = null
  previousHtmlOverflow = null
}

const getFocusableElements = () => {
  if (!modalRef.value) return []

  return Array.from(
    modalRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('hidden'))
}

const onWindowKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key !== 'Tab') return

  const focusableElements = getFocusableElements()
  if (!focusableElements.length) return

  const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
  const nextIndex = event.shiftKey
    ? currentIndex <= 0
      ? focusableElements.length - 1
      : currentIndex - 1
    : currentIndex === focusableElements.length - 1
      ? 0
      : currentIndex + 1

  event.preventDefault()
  focusableElements[nextIndex]?.focus()
}

const submit = async () => {
  if (isSubmitting.value) return

  errorMsg.value = ''
  isSubmitting.value = true

  try {
    const sourcePage = typeof window === 'undefined' ? '' : window.location.href
    await httpPost('/api/v1/contacts', {
      name: form.value.name,
      phone: form.value.phone,
      wechat: '',
      message: form.value.message,
      source_page: sourcePage,
      ...readUtm(),
    })
    hasSubmitted.value = true
    form.value = createEmptyForm()
  } catch (error) {
    if (
      error instanceof HttpError &&
      typeof error.payload === 'object' &&
      error.payload !== null &&
      'error' in error.payload
    ) {
      errorMsg.value = String((error.payload as { error?: unknown }).error)
    } else {
      errorMsg.value = t('info.contactForm.error')
    }
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (typeof window === 'undefined') return

    if (isOpen) {
      previousActiveElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      lockPageScroll()
      window.addEventListener('keydown', onWindowKeydown)
      await nextTick()
      closeButtonRef.value?.focus()
      return
    }

    window.removeEventListener('keydown', onWindowKeydown)
    unlockPageScroll()

    const focusTarget = previousActiveElement
    previousActiveElement = null
    resetFormState()
    await nextTick()
    focusTarget?.focus()
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onWindowKeydown)
  }
  unlockPageScroll()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="contact-modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-5 backdrop-blur-sm sm:p-8"
        @click.self="close"
      >
        <section
          ref="modalRef"
          class="contact-modal__panel relative z-10 max-h-[calc(100vh-2.5rem)] w-full max-w-xl overflow-y-auto border border-black/10 bg-white p-6 shadow-2xl sm:p-8"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
        >
          <header class="flex items-start justify-between gap-6 border-b border-black/10 pb-5">
            <div>
              <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-black/45">
                {{ t('contactModal.eyebrow') }}
              </p>
              <h2
                :id="titleId"
                class="mt-2 font-display text-2xl font-bold tracking-[0.12em] text-black"
              >
                {{ t('contactModal.title') }}
              </h2>
            </div>
            <button
              ref="closeButtonRef"
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center border border-black/15 text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              :aria-label="t('contactModal.close')"
              :title="t('contactModal.close')"
              @click="close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <path
                  d="M18 6L6 18"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </header>

          <p :id="descriptionId" class="pt-5 font-sans text-sm leading-7 text-black/65">
            {{ hasSubmitted ? t('contactModal.successBody') : t('info.appointmentBody') }}
          </p>

          <form v-if="!hasSubmitted" class="mt-6 space-y-4" @submit.prevent="submit">
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-black/55">
                  {{ t('info.contactForm.name') }}<span aria-hidden="true"> *</span>
                </span>
                <input
                  v-model.trim="form.name"
                  name="name"
                  autocomplete="name"
                  required
                  class="mt-2 h-10 w-full border border-border px-3"
                />
              </label>
              <label class="block">
                <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-black/55">
                  {{ t('info.contactForm.phone') }}<span aria-hidden="true"> *</span>
                </span>
                <input
                  v-model.trim="form.phone"
                  name="phone"
                  type="tel"
                  autocomplete="tel"
                  required
                  class="mt-2 h-10 w-full border border-border px-3"
                />
              </label>
            </div>
            <label class="block">
              <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-black/55">
                {{ t('info.contactForm.message') }}<span aria-hidden="true"> *</span>
              </span>
              <textarea
                v-model.trim="form.message"
                name="message"
                rows="4"
                required
                class="mt-2 w-full border border-border px-3 py-2"
              ></textarea>
            </label>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="h-12 w-full border border-black bg-brand font-mono text-xs uppercase tracking-[0.25em] text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-60"
            >
              {{ isSubmitting ? t('info.contactForm.submitting') : t('info.contactForm.submit') }}
            </button>
            <p v-if="errorMsg" class="font-mono text-xs text-red-600" role="alert">
              {{ errorMsg }}
            </p>
          </form>

          <div
            v-else
            class="mt-6 grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] sm:items-center"
          >
            <figure class="m-0">
              <div
                class="mx-auto aspect-square w-full max-w-[16rem] border border-black/10 bg-[#f4f4f1] p-3"
              >
                <img
                  :src="wechatQrPlaceholder"
                  :alt="t('contactModal.placeholderAlt')"
                  class="h-full w-full object-contain"
                />
              </div>
              <figcaption
                class="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-black/40"
              >
                {{ t('contactModal.placeholderNote') }}
              </figcaption>
            </figure>

            <div>
              <h3 class="font-display text-xl font-bold tracking-[0.1em] text-black">
                {{ t('contactModal.successTitle') }}
              </h3>
              <dl class="mt-5 border-y border-black/10 py-4">
                <dt class="font-mono text-[9px] uppercase tracking-[0.2em] text-black/40">
                  {{ t('contactModal.nicknameLabel') }}
                </dt>
                <dd
                  class="mt-2 break-all font-mono text-base font-bold tracking-[0.12em] text-black"
                >
                  {{ t('contactModal.nickname') }}
                </dd>
              </dl>
              <button
                type="button"
                class="mt-5 h-11 w-full border border-black bg-white font-mono text-xs uppercase tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white"
                @click="close"
              >
                {{ t('contactModal.done') }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.contact-modal-enter-active,
.contact-modal-leave-active {
  transition: opacity 180ms ease;
}

.contact-modal-enter-active .contact-modal__panel,
.contact-modal-leave-active .contact-modal__panel {
  transition:
    transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 180ms ease;
}

.contact-modal-enter-from,
.contact-modal-leave-to,
.contact-modal-enter-from .contact-modal__panel,
.contact-modal-leave-to .contact-modal__panel {
  opacity: 0;
}

.contact-modal-enter-from .contact-modal__panel,
.contact-modal-leave-to .contact-modal__panel {
  transform: translateY(12px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .contact-modal-enter-active,
  .contact-modal-leave-active,
  .contact-modal-enter-active .contact-modal__panel,
  .contact-modal-leave-active .contact-modal__panel {
    transition: none;
  }
}
</style>
