import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HeroScrollProgress } from '@/modules/silk/silkRenderer'

gsap.registerPlugin(ScrollTrigger)

export type HomeAnimationsController = {
    initAnimations: () => void
    disposeAnimations: () => void
}

export const useHomeAnimations = (heroScrollProgress: HeroScrollProgress): HomeAnimationsController => {
    let ctx: gsap.Context | null = null

    const initAnimations = () => {
        ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

            tl.fromTo(
                '.hero-sub',
                { y: 32, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, delay: 0.25 }
            )
                .to(
                    '#hero-text-1',
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.4,
                        skewX: -8,
                        filter: 'blur(0px)',
                    },
                    '-=0.9'
                )
                .from(
                    '#hero-text-1',
                    {
                        y: 110,
                        filter: 'blur(16px)',
                    },
                    '<'
                )
                .to(
                    '#hero-text-2',
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.4,
                        skewX: -8,
                        filter: 'blur(0px)',
                    },
                    '-=1.2'
                )
                .from(
                    '#hero-text-2',
                    {
                        y: 140,
                        filter: 'blur(18px)',
                    },
                    '<'
                )
                .from(
                    '.hero-cta',
                    {
                        opacity: 0,
                        y: 20,
                        duration: 0.9,
                    },
                    '-=0.6'
                )
                .from(
                    '.hero-pill',
                    {
                        opacity: 0,
                        y: 24,
                        stagger: 0.08,
                        duration: 0.8,
                    },
                    '-=0.6'
                )
                .from(
                    '.hero-note',
                    {
                        opacity: 0,
                        y: 40,
                        duration: 1,
                    },
                    '-=0.5'
                )

            gsap.to('.hero-backdrop__grid', {
                scrollTrigger: {
                    trigger: 'header',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
                yPercent: 18,
                scale: 1.08,
            })

            gsap.utils.toArray<HTMLElement>('.project-item').forEach((item) => {
                gsap.from(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: 'top 90%',
                        toggleActions: 'play none none reverse',
                    },
                    y: 70,
                    opacity: 0,
                    duration: 1.2,
                    ease: 'power2.out',
                })
            })

            gsap.utils.toArray<HTMLElement>('.project-text-reveal').forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, letterSpacing: '0.4em' },
                    {
                        opacity: 1,
                        letterSpacing: '0.15em',
                        duration: 1.4,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 80%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                )
            })

            ScrollTrigger.create({
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                onUpdate: (self) => {
                    heroScrollProgress.target = self.progress
                },
            })
        })
    }

    const disposeAnimations = () => {
        ctx?.revert()
        ctx = null
        ScrollTrigger.killAll()
    }

    return {
        initAnimations,
        disposeAnimations,
    }
}
