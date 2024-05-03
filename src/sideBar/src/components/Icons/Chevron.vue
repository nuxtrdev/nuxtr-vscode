<template>
    <svg class="h-3 w-3 -rotate-90 transition-all duration-200" :class="{ 'rotate-0': listOpen }" viewBox="0 0 11 7" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L5.5 5.5L10 1" stroke="currentColor" stroke-width="1.38" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
</template>

<script setup lang="ts">
defineProps({
    listOpen: {
        type: Boolean,
        default: false,
    },
});
</script>
