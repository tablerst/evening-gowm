<template>
    <section id="atelier" class="section-block atelier-section">
        <div class="page-shell">
            <div class="section-heading">
                <div>
                    <p class="eyebrow">THE ATELIER</p>
                    <h2 class="text-2xl md:text-4xl font-serif">工坊流程 · Linear Precision</h2>
                </div>
                <p class="section-heading__lede">
                    以界面化的方式呈现高定流程，让客户像阅读产品规格一样理解面料克重、缝制工序与排期。
                </p>
            </div>

            <div class="atelier-grid">
                <article class="atelier-panel project-item">
                    <h3 class="text-xl font-serif mb-6">Routine Timeline</h3>
                    <ul class="atelier-list">
                        <li>
                            <strong>DAY 01 · PATTERN SKETCH</strong>
                            <span>72h 线稿与立体裁剪，使用透明塔夫绸校准版型</span>
                        </li>
                        <li>
                            <strong>DAY 04 · MATERIAL CURATION</strong>
                            <span>香槟白塔夫绸 × 雾面珠光纱，记录温湿度与肌理</span>
                        </li>
                        <li>
                            <strong>DAY 09 · FITTING</strong>
                            <span>三轮试衣 + 激光刺绣定位，保留每次调整的 Data Log</span>
                        </li>
                    </ul>
                    <div class="atelier-meta">
                        <div class="atelier-meta__item">透光测试</div>
                        <div class="atelier-meta__item">香调匹配</div>
                        <div class="atelier-meta__item">触感档案</div>
                    </div>
                </article>

                <article class="atelier-panel project-item">
                    <h3 class="text-xl font-serif mb-4">Material Lab</h3>
                    <p class="text-sm text-stone leading-relaxed">
                        采用高调摄影的曝光策略记录每次用料，
                        并以数字孪生方式同步到 WebGL 丝绸的着色器参数，确保线上线下色温一致。
                    </p>
                    <div class="hero-pill-group mt-6">
                        <div class="hero-pill">
                            <span class="hero-pill__label">reflectance</span>
                            <span class="hero-pill__value">0.78 · pearl</span>
                        </div>
                        <div class="hero-pill">
                            <span class="hero-pill__label">roughness</span>
                            <span class="hero-pill__value">0.32 · satin</span>
                        </div>
                    </div>
                    <div class="hero-pill-group mt-4">
                        <div class="hero-pill">
                            <span class="hero-pill__label">color drift</span>
                            <span class="hero-pill__value">冷白 ↔ 暖金</span>
                        </div>
                        <div class="hero-pill">
                            <span class="hero-pill__label">wind profile</span>
                            <span class="hero-pill__value">Perlin 0.6</span>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>
