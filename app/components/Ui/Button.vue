<script setup lang="ts">
interface Props {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'active' | 'outlined'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  active?: boolean
  as?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  as: 'button'
})
</script>

<template>
  <component
    :is="as"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--active-state': active }]"
  >
    <slot />
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: var(--foreground);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
.btn--default {
  background: #333;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.btn--default:hover:not(:disabled) {
  background: #444;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.btn--secondary {
  background: #444;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.btn--secondary:hover:not(:disabled) {
  background: #555;
}

.btn--destructive {
  background: #dc2626;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.btn--destructive:hover:not(:disabled) {
  background: #ef4444;
}

.btn--outline {
  background: transparent;
  border: 1px solid #444;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.btn--outline:hover:not(:disabled) {
  background: #333;
  color: #fff;
}

.btn--ghost {
  background: transparent;
  box-shadow: none;
}
.btn--ghost:hover:not(:disabled) {
  background: #333;
}

.btn--link {
  background: transparent;
  color: #666;
  text-decoration: underline;
  box-shadow: none;
}

.btn--active {
  background: var(--accent);
  color: var(--accent-foreground);
}

.btn--outlined {
  background: transparent;
  border: 2px solid var(--accent);
  color: var(--accent);
  box-shadow: none;
}
.btn--outlined:hover:not(:disabled) {
  background: var(--accent);
  color: var(--accent-foreground);
}

.btn--active-state {
  background: var(--accent) !important;
  color: var(--accent-foreground) !important;
}

/* Sizes */
.btn--sm {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
}

.btn--lg {
  padding: 12px 24px;
  font-size: 15px;
  border-radius: 8px;
}

.btn--icon {
  padding: 8px;
  width: 36px;
  height: 36px;
  border-radius: 6px;
}
</style>