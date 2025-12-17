import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { appEnv } from '@/config/env'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views/HomeView.vue'),
        meta: {
            layout: 'default',
            title: 'White Phantom',
        },
    },
    {
        path: '/preview',
        name: 'preview',
        component: () => import('../views/PreviewView.vue'),
        meta: {
            layout: 'blank',
            title: 'Preview · White Phantom',
        },
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/',
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to) {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            }
        }
        return { top: 0 }
    },
})

router.beforeEach((to) => {
    // 预览模式：站点全局只允许访问 /preview
    if (appEnv.previewMode && to.name !== 'preview') {
        return { name: 'preview', replace: true }
    }

    // 非预览模式：避免用户误入 /preview
    if (!appEnv.previewMode && to.name === 'preview') {
        return { name: 'home', replace: true }
    }
})

router.afterEach((to) => {
    if (typeof document === 'undefined') return

    const title = typeof to.meta.title === 'string' ? to.meta.title : null
    if (title) {
        document.title = title
    }
})

export default router
