<template>
  <div class="relative" ref="root">
    <button
      class="relative block w-full rounded-md border border-[var(--vscode-dropdown-border)] bg-[var(--vscode-dropdown-background)] px-3 py-2 pr-10 text-[var(--vscode-foreground)]"
      @click.prevent="toggleMenu()"
    >
      <span class="flex text-left">{{ label }}</span>
      <span
        class="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
          role="img"
          class="mr-2 h-5 w-5"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M17 9.17a1 1 0 0 0-1.41 0L12 12.71L8.46 9.17a1 1 0 0 0-1.41 0a1 1 0 0 0 0 1.42l4.24 4.24a1 1 0 0 0 1.42 0L17 10.59a1 1 0 0 0 0-1.42Z"
          ></path>
        </svg>
      </span>
      <div
        class="absolute right-0 z-10 mt-3.5 flex max-h-[230px] flex-col gap-0.5 overflow-y-auto rounded-md border border-[var(--vscode-dropdown-border)] bg-[var(--vscode-dropdown-background)] p-1"
        v-show="dropdownOpen"
      >
        <button
          v-for="(item, i) in items"
          :key="i"
          class="relative rounded-[4px] px-2 py-1.5 pr-8 text-left text-sm font-medium hover:bg-[var(--vscode-list-activeSelectionBackground)]"
          :class="{
            'bg-[var(--vscode-list-activeSelectionBackground)]':
              item === selecteditemValue,
          }"
          @click.prevent="selectItem(item as string)"
        >
          <span>{{ item }}</span>
          <span
            v-if="item === selecteditemValue"
            class="pointer-events-none absolute bottom-0 right-2 top-0 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              class="inline-block h-4 w-4 align-middle"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47Z"
              ></path>
            </svg>
          </span>
        </button>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

// define props
const props = defineProps({
  label: {
    type: String,
    default: "Version",
  },
  items: {
    type: Array,
    required: true,
  },
  selecteditemValue: {
    type: String,
    default: "",
  },
});

// define emits
const emit = defineEmits(["selectedItem"]);

// define refs
const root = ref(null);
const dropdownOpen = ref(false);

// toggle dropdown menu
const toggleMenu = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

// select item
const selectItem = (item: string) => {
  // emit event to parent
  emit("selectedItem", item);
};

watch(
  () => props.items,
  (newVal) => {
    if (!newVal.includes(props.selecteditemValue)) {
      emit("selectedItem", "All");
    }
  },
);

// close dropdown menu when clicked outside
onMounted(() => {
  document.addEventListener("click", (e) => {
    // @ts-ignore
    if (root.value?.contains(e.target)) return;
    dropdownOpen.value = false;
  });
});
</script>
