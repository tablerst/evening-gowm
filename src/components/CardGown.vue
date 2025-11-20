<script setup lang="ts">
interface Props {
  image: string
  title: string
  tags?: string[]
  price?: string
  scene?: string
}

defineProps<Props>()
</script>

<template>
  <article class="card-gown">
    <div class="card-gown__media">
      <img :src="image" :alt="title" loading="lazy" />
      <div class="card-gown__tags" v-if="tags && tags.length">
        <span v-for="tag in tags" :key="tag" class="tag">#{{ tag }}</span>
      </div>

      <div class="card-gown__overlay">
        <button class="btn btn--primary">预约这款礼服</button>
        <button class="btn btn--secondary">查看详情</button>
      </div>
    </div>

    <div class="card-gown__info">
      <h3 class="card-gown__title">{{ title }}</h3>
      <div class="card-gown__meta">
        <span v-if="scene">{{ scene }}</span>
        <span v-if="price" class="card-gown__price">{{ price }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/styles/abstracts/variables' as vars;

.card-gown {
  display: flex;
  flex-direction: column;
  gap: vars.$space-3;

  &__media {
    position: relative;
    width: 100%;
    aspect-ratio: 3/4;
    border-radius: vars.$radius-lg;
    overflow: hidden;
    background-color: var(--color-bg-hero);
    box-shadow: vars.$shadow-sm;
    transition: box-shadow 0.3s ease;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    &:hover {
      box-shadow: vars.$shadow-md;

      img {
        transform: scale(1.03);
      }

      .card-gown__overlay {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  &__tags {
    position: absolute;
    bottom: vars.$space-3;
    left: vars.$space-3;
    display: flex;
    gap: vars.$space-1;
    z-index: 2;

    .tag {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      padding: 2px 8px;
      border-radius: vars.$radius-pill;
      font-size: vars.$font-size-xs;
      color: var(--color-text-primary);
    }
  }

  &__overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: vars.$space-4;
    background: linear-gradient(to top, rgba(20, 10, 30, 0.8), transparent);
    display: flex;
    flex-direction: column;
    gap: vars.$space-2;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    z-index: 3;

    // Override button styles for card context if needed
    .btn {
      width: 100%;
    }

    .btn--secondary {
      background: rgba(255, 255, 255, 0.9);
      border: none;
      color: var(--color-brand-dark);

      &:hover {
        background: white;
      }
    }
  }

  &__info {
    padding: 0 vars.$space-1;
  }

  &__title {
    font-size: vars.$font-size-lg;
    font-weight: 500;
    margin-bottom: vars.$space-1;
    color: var(--color-text-primary);
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    font-size: vars.$font-size-sm;
    color: var(--color-text-secondary);
  }

  &__price {
    font-family: vars.$font-family-english;
    color: var(--color-brand-primary);
  }
}
</style>
