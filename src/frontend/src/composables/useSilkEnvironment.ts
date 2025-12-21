import { onBeforeUnmount, onMounted } from 'vue'
import type { NetworkInformationLike, NavigatorWithConnection } from '@/modules/silk/silkRenderer'

export type SilkEnvironmentOptions = {
    evaluateSilkFallback: () => void
    syncMotionPreference: (shouldReduce: boolean) => void
}

export const useSilkEnvironment = ({
    evaluateSilkFallback,
    syncMotionPreference,
}: SilkEnvironmentOptions) => {
    let motionQuery: MediaQueryList | null = null
    let motionChangeHandler: ((event: MediaQueryListEvent) => void) | null = null
    let networkInfo: NetworkInformationLike | null = null
    let networkChangeHandler: (() => void) | null = null

    onMounted(() => {
        evaluateSilkFallback()

        if (typeof window !== 'undefined' && 'matchMedia' in window) {
            motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
            syncMotionPreference(motionQuery.matches)
            motionChangeHandler = (event: MediaQueryListEvent) => {
                syncMotionPreference(event.matches)
            }
            motionQuery.addEventListener('change', motionChangeHandler)
        } else {
            syncMotionPreference(false)
        }

        if (typeof navigator !== 'undefined') {
            const nav = navigator as NavigatorWithConnection
            networkInfo = nav.connection ?? null
            if (networkInfo?.addEventListener) {
                networkChangeHandler = () => {
                    evaluateSilkFallback()
                }
                networkInfo.addEventListener('change', networkChangeHandler)
            }
        }
    })

    onBeforeUnmount(() => {
        if (motionQuery && motionChangeHandler) {
            motionQuery.removeEventListener('change', motionChangeHandler)
        }
        motionQuery = null
        motionChangeHandler = null

        if (networkInfo && networkChangeHandler && networkInfo.removeEventListener) {
            networkInfo.removeEventListener('change', networkChangeHandler)
        }
        networkInfo = null
        networkChangeHandler = null
    })
}
